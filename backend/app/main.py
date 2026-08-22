from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.models import User, Shipment
from app.routes import auth, shipments, gps, alerts, audit
from app.websockets import manager
from app.schemas import HealthResponse

def init_db():
    """
    Initialize SQLite database and seed initial data.
    
    Why SQLite?
    For a 6-hour hackathon, SQLite provides zero-configuration, self-contained data storage.
    This eliminates network latency and Docker setup issues during development and the live demo.
    
    Production improvement:
    Migrate to PostgreSQL to handle high-concurrency writes from thousands of IoT devices.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed demo user
        if not db.query(User).filter(User.user_id == "operator_01").first():
            user = User(user_id="operator_01", password_hash="demo-hash", role="operator")
            db.add(user)
            
        # Seed demo shipment
        if not db.query(Shipment).filter(Shipment.shipment_id == "CT-1042").first():
            shipment = Shipment(
                shipment_id="CT-1042",
                shipment_type="pharmaceutical",
                status="IN_TRANSIT",
                integrity_score=9.5,
                risk_level="LOW"
            )
            db.add(shipment)
        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

# Why FastAPI?
# FastAPI provides native async support which is crucial for handling thousands of 
# concurrent WebSocket connections and GPS pings. It also auto-generates Swagger docs,
# allowing the frontend team to work in parallel without manually maintaining API documentation.
app = FastAPI(
    title="ChainTrace API",
    description="Backend API for the ChainTrace hackathon project",
    version="1.0.0",
    lifespan=lifespan
)

# Why these CORS settings?
# During the hackathon, the frontend (Vite/React) and mobile (Expo) teams run on localhost
# or internal IP addresses. Using a wildcard (*) prevents cross-origin blocks that cost
# valuable development time.
# Production improvement: Restrict to explicit production domains (e.g., https://app.chaintrace.com).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(shipments.router)
app.include_router(gps.router)
app.include_router(alerts.router)
app.include_router(audit.router)

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")

@app.websocket("/ws/shipments/{shipment_id}")
async def websocket_endpoint(websocket: WebSocket, shipment_id: str):
    await manager.connect(websocket, shipment_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, shipment_id)
