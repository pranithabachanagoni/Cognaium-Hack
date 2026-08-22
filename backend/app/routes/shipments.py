from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Shipment
from app.schemas import ShipmentListItem, ShipmentDetail, Location
from datetime import datetime, timezone

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("", response_model=List[ShipmentListItem])
def list_shipments(db: Session = Depends(get_db)):
    shipments = db.query(Shipment).all()
    return shipments

@router.get("/{shipment_id}", response_model=ShipmentDetail)
def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    current_loc = None
    if shipment.current_lat is not None and shipment.current_lng is not None:
        current_loc = Location(latitude=shipment.current_lat, longitude=shipment.current_lng)
        
    return ShipmentDetail(
        shipment_id=shipment.shipment_id,
        shipment_type=shipment.shipment_type,
        status=shipment.status,
        integrity_score=shipment.integrity_score,
        risk_level=shipment.risk_level,
        current_location=current_loc,
        blockchain_verified=True,  # Mocked
        last_update=shipment.updated_at or datetime.now(timezone.utc)
    )
