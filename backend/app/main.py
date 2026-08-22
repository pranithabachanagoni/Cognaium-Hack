from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.models import (
    engine, Base, SessionLocal, get_db,
    User, Shipment, GPSEvent, Alert, AuditRecord
)
from app.schemas import (
    HealthResponse, LoginRequest, LoginResponse, VerifyRequest, VerifyResponse,
    ShipmentListItem, ShipmentDetail, Location, GPSRequest, GPSResponse,
    AlertResponse, AuditResponse
)
from app.logic import manager, check_gps_anomaly, get_risk_level, update_integrity_score

def init_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if not db.query(User).filter(User.user_id == "operator_01").first():
            db.add(User(user_id="operator_01", password_hash="demo-hash", role="operator"))
        if not db.query(Shipment).filter(Shipment.shipment_id == "CT-1042").first():
            db.add(Shipment(shipment_id="CT-1042", shipment_type="pharmaceutical", status="IN_TRANSIT", integrity_score=9.5, risk_level="LOW"))
        db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="ChainTrace API", description="Backend API for the ChainTrace hackathon project", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return HealthResponse(status="ok")

@app.post("/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(request: LoginRequest):
    return LoginResponse(access_token="demo-token", token_type="bearer")

@app.post("/auth/verify", response_model=VerifyResponse, tags=["Auth"])
def verify_device(request: VerifyRequest):
    return VerifyResponse(authenticated=True, device_id=request.device_id)

@app.get("/shipments", response_model=List[ShipmentListItem], tags=["Shipments"])
def list_shipments(db: Session = Depends(get_db)):
    return db.query(Shipment).all()

@app.get("/shipments/{shipment_id}", response_model=ShipmentDetail, tags=["Shipments"])
def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    current_loc = Location(latitude=shipment.current_lat, longitude=shipment.current_lng) if shipment.current_lat is not None else None
        
    return ShipmentDetail(
        shipment_id=shipment.shipment_id,
        shipment_type=shipment.shipment_type,
        status=shipment.status,
        integrity_score=shipment.integrity_score,
        risk_level=shipment.risk_level,
        current_location=current_loc,
        blockchain_verified=True,
        last_update=shipment.updated_at or datetime.now(timezone.utc)
    )

@app.post("/shipments/{shipment_id}/gps", response_model=GPSResponse, tags=["GPS"])
async def submit_gps(shipment_id: str, request: GPSRequest, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    previous_gps = db.query(GPSEvent).filter(GPSEvent.shipment_id == shipment_id).order_by(GPSEvent.timestamp.desc()).first()
    is_anomaly, anomaly_type = check_gps_anomaly(request, previous_gps)
    
    if is_anomaly:
        shipment.integrity_score = update_integrity_score(shipment.integrity_score, anomaly_type)
        shipment.risk_level = get_risk_level(shipment.integrity_score)
        
        msg = f"Anomaly detected: {anomaly_type}"
        db.add(Alert(shipment_id=shipment_id, alert_type="GPS_ANOMALY", risk_level=shipment.risk_level, message=msg, latitude=request.latitude, longitude=request.longitude, timestamp=datetime.now(timezone.utc)))
        
        await manager.broadcast_to_shipment(shipment_id, {
            "type": "ANOMALY_ALERT", "shipment_id": shipment_id, "risk_level": shipment.risk_level, "integrity_score": shipment.integrity_score, "message": msg
        })

    db.add(GPSEvent(shipment_id=shipment_id, latitude=request.latitude, longitude=request.longitude, speed=request.speed, heading=request.heading, timestamp=request.timestamp, anomaly=is_anomaly, anomaly_type=anomaly_type))
    
    shipment.current_lat = request.latitude
    shipment.current_lng = request.longitude
    shipment.updated_at = datetime.now(timezone.utc)
    
    db.add(AuditRecord(shipment_id=shipment_id, event_type="GPS_UPDATE", integrity_score=shipment.integrity_score))
    db.commit()
    
    return GPSResponse(shipment_id=shipment_id, anomaly=is_anomaly, anomaly_type=anomaly_type, risk_level=shipment.risk_level, integrity_score=shipment.integrity_score, blockchain_record_pending=False)

@app.get("/shipments/{shipment_id}/alerts", response_model=List[AlertResponse], tags=["Alerts"])
def get_alerts(shipment_id: str, db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.shipment_id == shipment_id).order_by(Alert.timestamp.desc()).all()

@app.get("/shipments/{shipment_id}/audit", response_model=List[AuditResponse], tags=["Audit"])
def get_audit(shipment_id: str, db: Session = Depends(get_db)):
    return db.query(AuditRecord).filter(AuditRecord.shipment_id == shipment_id).order_by(AuditRecord.timestamp.desc()).all()

@app.websocket("/ws/shipments/{shipment_id}")
async def websocket_endpoint(websocket: WebSocket, shipment_id: str):
    await manager.connect(websocket, shipment_id)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, shipment_id)
