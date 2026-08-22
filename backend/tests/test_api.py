from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime, timezone

def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

def test_list_shipments():
    with TestClient(app) as client:
        response = client.get("/shipments")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_get_shipment():
    with TestClient(app) as client:
        response = client.get("/shipments/CT-1042")
        assert response.status_code == 200
        data = response.json()
        assert data["shipment_id"] == "CT-1042"

def test_post_gps():
    with TestClient(app) as client:
        payload = {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "speed": 130.0,
            "heading": 90.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        response = client.post("/shipments/CT-1042/gps", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["anomaly"] is True
        assert data["anomaly_type"] == "IMPOSSIBLE_SPEED"

def test_get_alerts():
    with TestClient(app) as client:
        response = client.get("/shipments/CT-1042/alerts")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_get_audit():
    with TestClient(app) as client:
        response = client.get("/shipments/CT-1042/audit")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
