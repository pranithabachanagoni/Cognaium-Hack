from sqlalchemy import Boolean, Column, Float, Integer, String, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

SQLALCHEMY_DATABASE_URL = "sqlite:///./chaintrace.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="operator")
    device_id = Column(String, nullable=True)

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, unique=True, index=True)
    shipment_type = Column(String)
    status = Column(String)
    integrity_score = Column(Float)
    risk_level = Column(String)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GPSEvent(Base):
    __tablename__ = "gps_events"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float)
    heading = Column(Float)
    timestamp = Column(DateTime)
    anomaly = Column(Boolean, default=False)
    anomaly_type = Column(String, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, index=True)
    alert_type = Column(String)
    risk_level = Column(String)
    message = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditRecord(Base):
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(String, index=True)
    event_type = Column(String)
    integrity_score = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    tx_hash = Column(String, nullable=True)
    block_number = Column(Integer, nullable=True)
