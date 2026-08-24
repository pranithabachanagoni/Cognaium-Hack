from fastapi.testclient import TestClient
from app.main import app
from app.security import DEMO_OPERATOR_PASSWORD
from datetime import datetime, timezone

def _auth_headers(client: TestClient) -> dict:
    response = client.post("/auth/login", json={"user_id": "operator_01", "password": DEMO_OPERATOR_PASSWORD})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

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

def test_login_rejects_wrong_password():
    with TestClient(app) as client:
        response = client.post("/auth/login", json={"user_id": "operator_01", "password": "wrong-password"})
        assert response.status_code == 401

def test_login_rejects_unknown_user():
    with TestClient(app) as client:
        response = client.post("/auth/login", json={"user_id": "nobody", "password": "irrelevant"})
        assert response.status_code == 401

def test_post_gps_requires_auth():
    with TestClient(app) as client:
        payload = {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "speed": 40.0,
            "heading": 90.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        response = client.post("/shipments/CT-1042/gps", json=payload)
        assert response.status_code == 403

def test_post_gps():
    with TestClient(app) as client:
        headers = _auth_headers(client)
        payload = {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "speed": 130.0,
            "heading": 90.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        response = client.post("/shipments/CT-1042/gps", headers=headers, json=payload)
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

def test_verify_device_rejects_replayed_nonce():
    with TestClient(app) as client:
        headers = _auth_headers(client)
        payload = {"device_id": "device-abc", "nonce": "one-time-nonce-1"}
        first = client.post("/auth/verify", headers=headers, json=payload)
        assert first.status_code == 200
        assert first.json()["authenticated"] is True

        second = client.post("/auth/verify", headers=headers, json=payload)
        assert second.status_code == 401
