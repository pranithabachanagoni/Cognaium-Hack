from pathlib import Path
import math
import pickle

MODEL = Path(__file__).resolve().parent / "model.pkl"

def _load():
    if not MODEL.exists():
        from . import train  # noqa: F401
    with MODEL.open("rb") as f:
        return pickle.load(f)

model = _load()

def haversine(a, b):
    r = 6371.0
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dp = math.radians(b["lat"] - a["lat"])
    dl = math.radians(b["lng"] - a["lng"])
    x = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(math.sqrt(x))

def detect(distance_km, speed_kmh, expected, current):
    deviation = haversine(expected, current)
    features = [[distance_km, speed_kmh, deviation]]
    prediction = int(model.predict(features)[0])

    reasons = []
    if speed_kmh > 180:
        reasons.append("impossible/high-speed movement")
    if deviation > 20:
        reasons.append("large route deviation")
    if prediction == -1:
        reasons.append("ML anomaly pattern")

    anomaly = bool(reasons)
    if anomaly:
        severity = min(10, 5 + int(deviation / 20) + int(speed_kmh / 250))
        score = max(1.0, 10.0 - severity)
        risk = "HIGH" if severity >= 8 else "MEDIUM"
    else:
        score = 9.7
        risk = "LOW"

    return {
        "anomaly": anomaly,
        "risk": risk,
        "integrity_score": round(score, 1),
        "reason": ", ".join(reasons) if reasons else "trajectory within expected range",
        "deviation_km": round(deviation, 2),
    }
