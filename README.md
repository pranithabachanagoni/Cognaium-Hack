# ChainTrace

Hackathon MVP for real-time shipment integrity monitoring.

## Features
- FastAPI backend
- JWT-style authentication with password hashing
- Replay protection using nonce + timestamp
- Synthetic GPS trajectory generation
- Lightweight ML anomaly detector trained locally with scikit-learn
- Integrity score (1-10)
- Tamper-evident audit records using SHA-256
- Local blockchain-style audit ledger for a zero-dependency demo
- React Native / Expo mobile dashboard
- Simulated anomaly injection for the live demo

## Important hackathon note
The supplied problem statement requires a test blockchain network, but this starter MVP uses a local append-only blockchain-style ledger so it runs immediately without external services. Replace `backend/blockchain/ledger.py` with a real testnet adapter when RPC credentials are available.

## Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 ml/train.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Default demo account:
- username: `demo`
- password: `ChainTrace@123`

## Run mobile

Install Node.js and Expo.

```bash
cd mobile
npm install
npx expo start
```

Set `API_URL` in `mobile/.env` to the machine's LAN IP, e.g. `http://192.168.1.10:8000`.

For a fast browser demo, the Expo web target also works:

```bash
npx expo start --web
```

## Demo flow

1. Login as `demo`.
2. Open shipment `CT-001`.
3. Observe a normal integrity score.
4. Press **Inject GPS Anomaly**.
5. Backend detects route/speed anomaly.
6. Integrity score drops and an alert is created.
7. Audit record is appended to the local tamper-evident ledger.
8. Open **Audit Trail** to show the evidence.

## API
- POST `/auth/login`
- GET `/shipments`
- GET `/shipments/{shipment_id}`
- POST `/shipments/{shipment_id}/gps`
- POST `/shipments/{shipment_id}/simulate-anomaly`
- GET `/shipments/{shipment_id}/audit`
- GET `/health`
