import math
import json
import os
import joblib
import numpy as np
from typing import Tuple, Optional, List, Dict
from fastapi import WebSocket

from app.schemas import GPSRequest
from app.models import GPSEvent

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "gps_anomaly_model.joblib")
try:
    anomaly_model = joblib.load(MODEL_PATH)
except Exception:
    anomaly_model = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, shipment_id: str):
        await websocket.accept()
        self.active_connections.setdefault(shipment_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, shipment_id: str):
        if shipment_id in self.active_connections:
            self.active_connections[shipment_id].remove(websocket)
            if not self.active_connections[shipment_id]:
                del self.active_connections[shipment_id]

    async def broadcast_to_shipment(self, shipment_id: str, message: dict):
        for connection in self.active_connections.get(shipment_id, []):
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    a = math.sin((lat2 - lat1) / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# Higher-value/riskier cargo gets tighter thresholds than the default profile.
SHIPMENT_TYPE_THRESHOLDS: Dict[str, Dict[str, float]] = {
    "pharmaceutical": {"speed": 100.0, "jump": 300.0},
    "electronics": {"speed": 110.0, "jump": 400.0},
}
DEFAULT_THRESHOLDS = {"speed": 120.0, "jump": 500.0}

# Small per-clean-ping recovery so a shipment that trips one anomaly and then
# behaves isn't stuck at its worst-ever score for the rest of transit.
SCORE_RECOVERY_STEP = 0.1
MAX_SCORE = 10.0

def check_gps_anomaly(current_gps: GPSRequest, previous_gps: Optional[GPSEvent] = None, shipment_type: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    thresholds = SHIPMENT_TYPE_THRESHOLDS.get((shipment_type or "").lower(), DEFAULT_THRESHOLDS)
    speed_anomaly = current_gps.speed > thresholds["speed"]
    dist = calculate_distance(previous_gps.latitude, previous_gps.longitude, current_gps.latitude, current_gps.longitude) if previous_gps else 0.0
    dist_anomaly = dist > thresholds["jump"]

    if anomaly_model and previous_gps:
        prediction = anomaly_model.predict(np.array([[current_gps.speed, dist]]))[0]
        if prediction == -1:
            return True, "IMPOSSIBLE_SPEED" if speed_anomaly else "GPS_JUMP" if dist_anomaly else "ML_ANOMALY"

    if speed_anomaly: return True, "IMPOSSIBLE_SPEED"
    if dist_anomaly: return True, "GPS_JUMP"

    return False, None

def get_risk_level(score: float) -> str:
    if score >= 8: return "LOW"
    return "MEDIUM" if score >= 5 else "HIGH"

def update_integrity_score(current_score: float, anomaly_type: Optional[str]) -> float:
    if not anomaly_type:
        return min(MAX_SCORE, current_score + SCORE_RECOVERY_STEP)
    penalties = {"GPS_JUMP": 3.0, "IMPOSSIBLE_SPEED": 3.0}
    return max(1.0, current_score - penalties.get(anomaly_type, 2.0))

