import requests
import time
import json

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Testing 404 on /shipments/{id}/alerts...")
    r = requests.get(f"{BASE_URL}/shipments/FAKE-123/alerts")
    print(f"Status: {r.status_code}") # Should be 404

    print("\n2. Testing unauthenticated POST /shipments/{id}/gps...")
    r = requests.post(f"{BASE_URL}/shipments/CT-1042/gps", json={
        "latitude": 28.0, "longitude": 77.0, "speed": 40.0, "heading": 90.0, "timestamp": "2026-08-22T10:00:00Z"
    })
    print(f"Status: {r.status_code}") # Should be 403 (HTTPBearer's default for a missing Authorization header)

    print("\n3. Testing Auth Login...")
    r = requests.post(f"{BASE_URL}/auth/login", json={"user_id": "operator_01", "password": "chaintrace-demo-2026"})
    token = r.json().get("access_token")
    print(f"Token obtained: {token[:15]}...")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n4. Testing Pydantic GPS Validation (Invalid Latitude)...")
    r = requests.post(f"{BASE_URL}/shipments/CT-1042/gps", headers=headers, json={
        "latitude": 200.0, "longitude": 77.0, "speed": 40.0, "heading": 90.0, "timestamp": "2026-08-22T10:00:00Z"
    })
    print(f"Status: {r.status_code}") # Should be 422

    print("\n5. Testing Replay Attack...")
    payload = {
        "latitude": 28.0, "longitude": 77.0, "speed": 40.0, "heading": 90.0, "timestamp": "2026-08-22T10:10:00Z"
    }
    r1 = requests.post(f"{BASE_URL}/shipments/CT-1042/gps", headers=headers, json=payload)
    print(f"First request: {r1.status_code}")
    
    # Replay identical timestamp
    r2 = requests.post(f"{BASE_URL}/shipments/CT-1042/gps", headers=headers, json=payload)
    print(f"Replayed request: {r2.status_code} - Detail: {r2.text}") # Should be 400

    print("\n6. Testing Blockchain tx_hash...")
    r = requests.get(f"{BASE_URL}/shipments/CT-1042/audit")
    if r.status_code == 200:
        audits = r.json()
        print(f"Latest audit tx_hash: {audits[0].get('tx_hash')} (was null before)")
    
if __name__ == "__main__":
    run_tests()
