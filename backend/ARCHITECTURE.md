# ChainTrace Architecture & Engineering Decisions

This document outlines the architectural and technical decisions made for the ChainTrace backend. It serves as a defense-ready guide to our design philosophy, constraints, and future roadmap.

## 1. System Overview

ChainTrace is designed to monitor high-frequency GPS data from shipments, determine their integrity in real-time, and act as a bridge to a secure blockchain ledger for auditability.

```mermaid
flowchart TD
    Mobile[Mobile App/GPS Tracker]
    API[FastAPI Backend]
    DB[(SQLite/Relational DB)]
    ML[Anomaly Detection (Future)]
    INT[Integrity Engine (Rules)]
    WS[WebSocket Manager]
    BC[Blockchain Ledger]

    Mobile -->|REST POST /gps| API
    API -->|Read/Write| DB
    API -->|Evaluate| INT
    INT -.->|Future Upgrade| ML
    INT -->|Score & Risk| API
    API -->|Trigger Alert| WS
    WS -->|Real-time| Mobile
    API -.->|Bridged Audit Log| BC
```

## 2. Request Flow & Why REST
We chose **REST** for the primary endpoints (e.g., submitting GPS data, fetching shipments) because it aligns with standard HTTP caching, load balancing, and is easily consumed by any frontend or mobile framework. A GraphQL approach was considered but deemed overkill for our fixed, predictable data structures.

## 3. Database Design: Why SQLite?
For a 6-hour hackathon, **SQLite** was chosen to eliminate database setup time, network latency issues, and external dependencies. 

*Production Improvement*: In a production environment, this would be replaced with **PostgreSQL**. SQLite locks the entire database on writes, which would bottleneck the high-volume ingestion of GPS data from thousands of concurrent devices. PostgreSQL handles concurrent writes efficiently and provides PostGIS for advanced geospatial queries.

## 4. Authentication Flow
Currently, the authentication uses deterministic mock tokens. 

*Why?* Building a robust identity provider (OAuth2, MFA) consumes significant hackathon time that is better spent on the core supply-chain logic. 
*Production Improvement*: We would implement JWTs signed via asymmetric keys, and device verification would rely on cryptographic nonces signed by the IoT device's private key to prevent replay attacks and impersonation.

## 5. GPS Processing Flow: Why Off-Chain?
High-frequency GPS data (e.g., one ping per second) is extremely costly and slow to write directly to a blockchain. 
*Why Off-Chain?* We store the raw GPS trajectory in our relational database. Only aggregate data, major state changes, or critical anomaly events (the "Audit Record") are intended to be anchored to the blockchain. This hybrid approach gives us the query speed of Web2 and the trust of Web3.

## 6. Integrity Scoring: Why Rules before ML?
The integrity score provides operators with an immediate, explainable metric of shipment health. 
*Why Rules?* We calculate this in the backend using strict rules (e.g., speed > 120km/h) to guarantee determinism for the MVP. Rule-based scores are fully transparent. 
*Production Improvement*: A machine learning model would monitor for subtle trajectory deviations. However, ML outputs probabilities. The Integrity Engine would remain as a translation layer that converts ML probabilities into a strict operational risk score.

## 7. Alert Generation
Alerts are decoupled from raw GPS data. If a shipment goes off-course, the backend generates an `Alert` entity. 
*Why?* This separation of concerns allows the frontend to query a lightweight `alerts` table for the dashboard without scanning millions of GPS rows.

## 8. WebSocket Communication: Why WS for Alerts?
While REST is used for data submission, we use **WebSockets** for alert dispatching. 
*Why?* Supply chain operators need immediate notification of theft or temperature anomalies. Polling a REST endpoint every second would drain mobile battery and overwhelm the backend. WebSockets allow the server to push critical alerts the millisecond they are detected.

## 9. Blockchain Integration Boundary
The API separates standard operational routes from the `/audit` route. 
*Why?* The blockchain acts as a decentralized notary. By keeping the blockchain logic separate, the system can continue to operate and collect data even if the RPC node or blockchain network experiences downtime. 

## 10. Frontend/Backend Contract
We use Pydantic schemas to strictly define our JSON inputs and outputs.
*Why?* This allows parallel development. The frontend team can build their UI against our Swagger documentation (`/docs`) without waiting for the backend implementation to finish.

## 11. Error Handling
We return standard HTTP status codes (400 for bad data, 404 for not found) rather than raw Python exceptions. This prevents leaking internal stack traces to the client, which is a critical security vulnerability.

## 12. Security Model & Replay Attacks
*Current limitation*: A malicious actor could sniff a GPS payload and resend it (replay attack) or send spoofed coordinates.
*Defense Strategy for Production*: Devices will sign their payload (GPS data + timestamp + incremental nonce) using a secure enclave private key. The backend will verify the signature and reject reused nonces or old timestamps.

## 13. Performance Considerations
The current MVP does synchronous database writes. 
*Production Improvement*: For high throughput, we would decouple GPS ingestion using a message broker (e.g., Kafka or RabbitMQ). The API would quickly acknowledge the payload, and background workers would process the anomaly detection and database insertions asynchronously.

## 14. Current MVP Limitations
- Rule-based anomaly detection is brittle and cannot handle complex detours.
- In-memory WebSocket manager will lose connections if the backend scales to multiple instances (requires Redis Pub/Sub).
- No actual blockchain writes yet (stubbed fields).

## 15. What Happens if GPS Data is Bad?
If a device sends erratic data (e.g., jumping 500km in 1 second due to signal multipath), our integrity engine flags it as a `GPS_JUMP`. 
*Why this matters*: We don't discard the data. We store it as an anomaly. Discarding bad data could accidentally hide evidence of tampering (e.g., a GPS spoofing device being used by thieves).
