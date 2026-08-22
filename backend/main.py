from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import math
import time
import uuid

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from ml.detector import detect

from blockchain.ledger import ledger

APP_DIR = Path(__file__).resolve().parent
SECRET = "CHANGE_THIS_FOR_PRODUCTION_CHAINTRACE"
ALGORITHM = "HS256"

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()

USERS = {
    "demo": pwd.hash("ChainTrace@123")
}

SHIPMENTS = {
    "CT-001": {
        "shipment_id": "CT-001",
        "type": "Pharmaceutical",
        "status": "IN TRANSIT",
        "origin": "Mumbai",
        "destination": "Pune",
        "integrity": 9.7,
        "risk": "LOW",
        "last_gps": {"lat": 19.0760, "lng": 72.8777, "timestamp": time.time()},
        "expected": {"lat": 19.0760, "lng": 72.8777},
        "events": [],
    }
}

USED_NONCES = set()


class LoginRequest(BaseModel):
    username: str
    password: str


class GPSUpdate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    timestamp: float
    nonce: str


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def auth_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET,
            algorithms=[ALGORITHM],
        )
        username = payload.get("sub")
        if not username or username not in USERS:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def validate_request(nonce: str, timestamp: float):
    now = time.time()
    if abs(now - timestamp) > 300:
        raise HTTPException(status_code=401, detail="Request timestamp expired")
    if nonce in USED_NONCES:
        raise HTTPException(status_code=409, detail="Replay attack blocked: nonce already used")
    USED_NONCES.add(nonce)


def distance_km(a, b):
    r = 6371.0
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dp = math.radians(b["lat"] - a["lat"])
    dl = math.radians(b["lng"] - a["lng"])
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(x))


def record_event(shipment, event_type, risk, score, metadata):
    payload = {
        "shipment_id": shipment["shipment_id"],
        "event_type": event_type,
        "risk": risk,
        "integrity_score": round(score, 2),
        "timestamp": utc_now(),
        "metadata": metadata,
    }
    raw = json.dumps(payload, sort_keys=True).encode()
    payload["event_hash"] = hashlib.sha256(raw).hexdigest()
    tx = ledger.append(payload)

    event = {**payload, "tx_id": tx}
    shipment["events"].append(event)

    return event


app = FastAPI(title="ChainTrace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ChainTrace"}


@app.post("/auth/login")
def login(req: LoginRequest):
    stored = USERS.get(req.username)
    if not stored or not pwd.verify(req.password, stored):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = jwt.encode(
        {"sub": req.username, "iat": int(time.time()), "exp": int(time.time()) + 3600},
        SECRET,
        algorithm=ALGORITHM,
    )
    return {"access_token": token, "token_type": "bearer"}


@app.get("/shipments")
def shipments(_: str = Depends(auth_user)):
    return list(SHIPMENTS.values())


@app.get("/shipments/{shipment_id}")
def shipment(shipment_id: str, _: str = Depends(auth_user)):
    item = SHIPMENTS.get(shipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return item


@app.get("/shipments/{shipment_id}/audit")
def audit(shipment_id: str, _: str = Depends(auth_user)):
    item = SHIPMENTS.get(shipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return item["events"]


@app.post("/shipments/{shipment_id}/gps")
def gps_update(shipment_id: str, req: GPSUpdate, _: str = Depends(auth_user)):
    validate_request(req.nonce, req.timestamp)
    item = SHIPMENTS.get(shipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")

    previous = item["last_gps"]
    current = {"lat": req.lat, "lng": req.lng, "timestamp": req.timestamp}
    dist = distance_km(previous, current)
    hours = max((req.timestamp - previous["timestamp"]) / 3600.0, 1 / 3600.0)
    speed = dist / hours

    result = detect(dist, speed, item["expected"], current)
    item["last_gps"] = current
    item["integrity"] = result["integrity_score"]
    item["risk"] = result["risk"]
    item["status"] = "FLAGGED" if result["anomaly"] else "IN TRANSIT"

    event = record_event(
        item,
        "GPS_ANOMALY" if result["anomaly"] else "GPS_UPDATE",
        result["risk"],
        result["integrity_score"],
        {
            "distance_km": round(dist, 3),
            "speed_kmh": round(speed, 2),
            "reason": result["reason"],
            "lat": req.lat,
            "lng": req.lng,
        },
    )

    return {"shipment": item, "analysis": result, "audit": event}


@app.post("/shipments/{shipment_id}/simulate-anomaly")
def simulate_anomaly(shipment_id: str, _: str = Depends(auth_user)):
    item = SHIPMENTS.get(shipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Deliberately create a large jump for the hackathon demonstration.
    now = time.time()
    req = GPSUpdate(
        lat=20.5937,
        lng=78.9629,
        timestamp=now,
        nonce=str(uuid.uuid4()),
    )
    return gps_update(shipment_id, req, "internal")


@app.get("/blockchain/verify")
def verify_ledger(_: str = Depends(auth_user)):
    return ledger.verify()
