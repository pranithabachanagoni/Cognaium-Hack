# ChainTrace Backend API

This is the FastAPI backend for the ChainTrace hackathon project. It provides the REST and WebSocket APIs needed by the frontend dashboard and mobile apps.

## Architecture & Code Structure

We have consolidated the entire backend into 4 core files to make it as simple as possible for the hackathon:
- `app/main.py`: Contains the FastAPI application, CORS setup, and all route definitions.
- `app/logic.py`: Contains the Integrity engine heuristics and the WebSocket connection manager.
- `app/models.py`: Contains the SQLAlchemy database connection setup and database models.
- `app/schemas.py`: Contains the Pydantic schemas defining the API contracts.

## Setup and Installation

### 1. Requirements

- Python 3.11+
- Virtual Environment (recommended)

### 2. Installation

Navigate to the `backend` directory and install the requirements:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run the Backend

Start the development server using Uvicorn:

```bash
uvicorn app.main:app --reload
```

The database (`chaintrace.db`) will be automatically created on the first run, seeded with a demo user (`operator_01`) and a demo shipment (`CT-1042`).

### 4. Base URL

- **API Base URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **WebSocket Base URL**: `ws://localhost:8000/ws`

## API Contract Summary

| METHOD | ENDPOINT | PURPOSE |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/login` | Login |
| POST | `/auth/verify` | Device verification |
| GET | `/shipments` | List shipments |
| GET | `/shipments/{id}` | Shipment details |
| POST | `/shipments/{id}/gps` | Submit GPS update |
| GET | `/shipments/{id}/alerts` | Get alerts |
| GET | `/shipments/{id}/audit` | Blockchain audit history |
| WS | `/ws/shipments/{id}` | Real-time alerts |

---

## Detailed API Endpoints

### 1. System Health

**GET `/health`**

Response:
```json
{
  "status": "ok"
}
```

### 2. Auth

**POST `/auth/login`**

Request:
```json
{
  "user_id": "operator_01",
  "password": "demo-password"
}
```

Response:
```json
{
  "access_token": "demo-token",
  "token_type": "bearer"
}
```

**POST `/auth/verify`**

Request:
```json
{
  "device_id": "device_001",
  "nonce": "abc123"
}
```

Response:
```json
{
  "authenticated": true,
  "device_id": "device_001"
}
```

### 3. Shipments

**GET `/shipments`**

Response:
```json
[
  {
    "shipment_id": "CT-1042",
    "shipment_type": "pharmaceutical",
    "status": "IN_TRANSIT",
    "integrity_score": 9.5,
    "risk_level": "LOW"
  }
]
```

**GET `/shipments/{shipment_id}`**

Response:
```json
{
  "shipment_id": "CT-1042",
  "shipment_type": "pharmaceutical",
  "status": "IN_TRANSIT",
  "integrity_score": 9.5,
  "risk_level": "LOW",
  "current_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "blockchain_verified": true,
  "last_update": "2026-08-22T08:45:20Z"
}
```

### 4. GPS & Integrity

**POST `/shipments/{shipment_id}/gps`**

Request:
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "speed": 42.5,
  "heading": 91,
  "timestamp": "2026-08-22T08:45:20Z"
}
```

Response:
```json
{
  "shipment_id": "CT-1042",
  "anomaly": false,
  "anomaly_type": null,
  "risk_level": "LOW",
  "integrity_score": 9.5,
  "blockchain_record_pending": false
}
```

*Note: If an anomaly occurs (e.g. speed > 120), the score drops, risk level changes, and a WebSocket alert is triggered.*

### 5. Alerts & Audit

**GET `/shipments/{shipment_id}/alerts`**

Response:
```json
[
  {
    "id": 1,
    "shipment_id": "CT-1042",
    "alert_type": "GPS_ANOMALY",
    "risk_level": "HIGH",
    "message": "Anomaly detected: IMPOSSIBLE_SPEED",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timestamp": "2026-08-22T08:46:04Z"
  }
]
```

**GET `/shipments/{shipment_id}/audit`**

Response:
```json
[
  {
    "id": 1,
    "event_type": "GPS_UPDATE",
    "integrity_score": 9.5,
    "timestamp": "2026-08-22T08:40:10Z",
    "tx_hash": null,
    "block_number": null
  }
]
```

### 6. WebSocket Notifications

**WS `/ws/shipments/{shipment_id}`**

Connect to this endpoint to receive real-time anomaly alerts for a specific shipment.

Example Message received:
```json
{
  "type": "ANOMALY_ALERT",
  "shipment_id": "CT-1042",
  "risk_level": "HIGH",
  "integrity_score": 4.0,
  "message": "Anomaly detected: IMPOSSIBLE_SPEED"
}
```
