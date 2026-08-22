from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import AuditRecord
from app.schemas import AuditResponse

router = APIRouter(prefix="/shipments", tags=["Audit"])

@router.get("/{shipment_id}/audit", response_model=List[AuditResponse])
def get_audit(shipment_id: str, db: Session = Depends(get_db)):
    """
    Fetch the blockchain audit trail for a shipment.
    
    Why keep blockchain logic separate from core API routes?
    - Decoupling ensures that if the blockchain network or RPC node experiences downtime,
      our core supply chain tracking and alert mechanics remain fully functional.
    - We treat the blockchain as a decentralized notary (Audit Layer) rather than 
      the primary state database, which guarantees high throughput for operations while 
      maintaining cryptographic trust for dispute resolution.
    """
    audits = db.query(AuditRecord).filter(AuditRecord.shipment_id == shipment_id).order_by(AuditRecord.timestamp.desc()).all()
    return audits
