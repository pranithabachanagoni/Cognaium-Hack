from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Alert
from app.schemas import AlertResponse

router = APIRouter(prefix="/shipments", tags=["Alerts"])

@router.get("/{shipment_id}/alerts", response_model=List[AlertResponse])
def get_alerts(shipment_id: str, db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.shipment_id == shipment_id).order_by(Alert.timestamp.desc()).all()
    return alerts
