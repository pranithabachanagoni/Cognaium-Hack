from typing import Optional

from ml.detector import detect, haversine


def detect_gps_anomaly(
    latitude: float,
    longitude: float,
    speed_kmh: float,
    previous_lat: Optional[float] = None,
    previous_lng: Optional[float] = None,
) -> dict:
    """
    Adapt the team GPS data format to the ML detector.
    """

    if previous_lat is None or previous_lng is None:
        return {
            "anomaly": False,
            "risk": "LOW",
            "integrity_score": 9.7,
            "reason": "insufficient GPS history for ML analysis",
            "deviation_km": 0.0,
        }

    expected = {
        "lat": previous_lat,
        "lng": previous_lng,
    }

    current = {
        "lat": latitude,
        "lng": longitude,
    }

    distance_km = haversine(expected, current)

    return detect(
        distance_km=distance_km,
        speed_kmh=speed_kmh,
        expected=expected,
        current=current,
    )
