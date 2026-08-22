import math
from typing import Tuple, Optional
from app.schemas import GPSRequest
from app.models import GPSEvent

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in kilometers
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def check_gps_anomaly(current_gps: GPSRequest, previous_gps: Optional[GPSEvent] = None) -> Tuple[bool, Optional[str]]:
    """
    Detect anomalies in GPS trajectories using deterministic heuristics.

    Why this approach for the MVP:
    - Rule-based detection provides 100% explainability for operators in the dashboard.
    - Deterministic rules are much easier to test and validate during a 6-hour hackathon
      compared to training and tuning an ML model.
      
    Production improvement:
    - Replace or augment these rigid thresholds with an ML anomaly detection model 
      (e.g., Isolation Forest or LSTM) that learns the expected routes and can flag 
      subtle deviations (like unexpected stops or slight route alterations) without 
      hardcoding speed limits or distance jumps.
    """
    if current_gps.speed > 120.0:
        return True, "IMPOSSIBLE_SPEED"
        
    if previous_gps:
        dist = calculate_distance(
            previous_gps.latitude, previous_gps.longitude,
            current_gps.latitude, current_gps.longitude
        )
        if dist > 500:
            return True, "GPS_JUMP"
            
    return False, None

def get_risk_level(score: float) -> str:
    if score >= 8:
        return "LOW"
    elif score >= 5:
        return "MEDIUM"
    else:
        return "HIGH"

def update_integrity_score(current_score: float, anomaly_type: Optional[str]) -> float:
    """
    Convert detected shipment risks into an operational 1-10 integrity score.

    Why we calculate this on the backend:
    - The score must be tamper-proof. If we calculated this in the mobile app, 
      a compromised client could send "perfect" scores despite malicious behavior.
    
    Why this specific point deduction system:
    - A penalty-based system starting from 10 is intuitive for dashboard operators.
    - Severe events (GPS_JUMP) penalize the score more heavily than minor infractions.
    
    Production improvement:
    - Use historical incident data to calibrate a more continuous risk decay function
      rather than relying on fixed integer penalties.
    """
    if not anomaly_type:
        return current_score
        
    score = current_score
    if anomaly_type == "GPS_JUMP":
        score -= 3.0
    elif anomaly_type == "IMPOSSIBLE_SPEED":
        score -= 3.0
    else:
        score -= 2.0
        
    return max(1.0, float(score))
