from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import asyncio

from app.database import get_db
from app.models import Shipment, GPSEvent, Alert, AuditRecord
from app.schemas import GPSRequest, GPSResponse
from app.services.integrity import check_gps_anomaly, get_risk_level, update_integrity_score
from app.websockets import manager

router = APIRouter(prefix="/shipments", tags=["GPS"])

@router.post("/{shipment_id}/gps", response_model=GPSResponse)
async def submit_gps(shipment_id: str, request: GPSRequest, db: Session = Depends(get_db)):
    """
    Ingest high-frequency GPS ping from the IoT tracker.
    
    Why this is an off-chain REST route:
    Writing every GPS ping directly to the blockchain is too slow and prohibitively expensive.
    By ingesting data off-chain into our fast relational DB, we get immediate querying capabilities
    for the dashboard, and we only bridge significant anomaly events to the ledger.
    """
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # We fetch the last GPS point to calculate sudden geographic jumps
    previous_gps = db.query(GPSEvent).filter(
        GPSEvent.shipment_id == shipment_id
    ).order_by(GPSEvent.timestamp.desc()).first()

    # We decouple the anomaly rules (integrity engine) from the API routing layer.
    # This allows a machine learning service to seamlessly replace this function call later.
    is_anomaly, anomaly_type = check_gps_anomaly(request, previous_gps)
    
    if is_anomaly:
        shipment.integrity_score = update_integrity_score(shipment.integrity_score, anomaly_type)
        shipment.risk_level = get_risk_level(shipment.integrity_score)
        
        # We spawn a separate Alert entity so the frontend dashboard can efficiently query 
        # a dedicated "Alerts" table without having to scan the massive GPS table.
        msg = f"Anomaly detected: {anomaly_type}"
        alert = Alert(
            shipment_id=shipment_id,
            alert_type="GPS_ANOMALY",
            risk_level=shipment.risk_level,
            message=msg,
            latitude=request.latitude,
            longitude=request.longitude,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(alert)
        
        # Why WebSockets for Alerts?
        # Operators monitoring valuable cargo need millisecond-level responsiveness. 
        # Waiting for the frontend to poll a REST endpoint every 30 seconds is unacceptable.
        alert_msg = {
            "type": "ANOMALY_ALERT",
            "shipment_id": shipment_id,
            "risk_level": shipment.risk_level,
            "integrity_score": shipment.integrity_score,
            "message": msg
        }
        await manager.broadcast_to_shipment(shipment_id, alert_msg)

    # We always save the GPS event, even if it's anomalous or spoofed.
    # Discarding bad data hides evidence of tampering.
    gps_event = GPSEvent(
        shipment_id=shipment_id,
        latitude=request.latitude,
        longitude=request.longitude,
        speed=request.speed,
        heading=request.heading,
        timestamp=request.timestamp,
        anomaly=is_anomaly,
        anomaly_type=anomaly_type
    )
    db.add(gps_event)
    
    # Update current state on the Shipment entity for fast retrieval by the main Dashboard view
    shipment.current_lat = request.latitude
    shipment.current_lng = request.longitude
    shipment.updated_at = datetime.now(timezone.utc)
    
    # We create an Audit record. This acts as the boundary interface to the Blockchain.
    # In production, a background worker consumes these records and submits them on-chain.
    audit = AuditRecord(
        shipment_id=shipment_id,
        event_type="GPS_UPDATE",
        integrity_score=shipment.integrity_score,
    )
    db.add(audit)

    db.commit()
    
    return GPSResponse(
        shipment_id=shipment_id,
        anomaly=is_anomaly,
        anomaly_type=anomaly_type,
        risk_level=shipment.risk_level,
        integrity_score=shipment.integrity_score,
        blockchain_record_pending=False
    )
