from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HealthResponse(BaseModel):
    status: str

class LoginRequest(BaseModel):
    user_id: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class VerifyRequest(BaseModel):
    device_id: str
    nonce: str

class VerifyResponse(BaseModel):
    authenticated: bool
    device_id: str

class Location(BaseModel):
    latitude: float
    longitude: float

class ShipmentListItem(BaseModel):
    shipment_id: str
    shipment_type: str
    status: str
    integrity_score: float
    risk_level: str
    
    class Config:
        orm_mode = True

class ShipmentDetail(BaseModel):
    shipment_id: str
    shipment_type: str
    status: str
    integrity_score: float
    risk_level: str
    current_location: Optional[Location] = None
    blockchain_verified: bool
    last_update: datetime
    
    class Config:
        orm_mode = True

class GPSRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    speed: float = Field(..., ge=0.0)
    heading: float = Field(..., ge=0.0, le=360.0)
    timestamp: datetime

class GPSResponse(BaseModel):
    shipment_id: str
    anomaly: bool
    anomaly_type: Optional[str] = None
    risk_level: str
    integrity_score: float
    blockchain_record_pending: bool

class AlertResponse(BaseModel):
    alert_id: int = Field(alias="id")
    shipment_id: str
    alert_type: str
    risk_level: str
    message: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime

    class Config:
        allow_population_by_field_name = True
        orm_mode = True

class AuditResponse(BaseModel):
    event_id: int = Field(alias="id")
    event_type: str
    integrity_score: float
    timestamp: datetime
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
