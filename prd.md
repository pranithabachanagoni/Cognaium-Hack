# ChainTrace

# ChainTrace

Title:
ChainTrace

Background:
In decentralized logistics, tracking high-value shipments across multiple carriers and jurisdictions is complicated by inconsistent data formats, untrusted intermediaries, and fragmented digital records. Even with blockchain-based tracking, verifying authenticity and detecting tampering in real-time remains a manual, slow process.

Problem Statement:
A logistics company is deploying blockchain-based shipment tracking but faces a critical gap: how to automatically detect and flag suspicious behavior (e.g., data tampering, identity spoofing, or unauthorized rerouting) during transit using real-time mobile data and blockchain evidence — all within a 6-hour operational window. The system must reconcile mobile GPS logs with on-chain records, detect anomalies using ML, and alert stakeholders securely — without relying on centralized oversight.

Scope:
Develop a mobile-first system that integrates blockchain, AI-driven anomaly detection, and cybersecurity hardening to provide real-time shipment integrity checks. The solution must support both on-chain and off-chain data sources and enforce secure identity validation.

MVP Scope:
• Build a mobile app that displays real-time shipment status and integrity score (1–10) • Integrate with a test blockchain network to read shipment state updates • Use AI/ML to analyze GPS trajectory data for anomalies (e.g., sudden jumps, loops) • Implement a lightweight cybersecurity layer to validate user identity and prevent spoofing • Display anomaly alerts and blockchain audit trail in-app • Deploy the backend and blockchain contract on a cloud testnet

Advanced/Bonus Scope:
• Add a gen-ai component to generate natural language explanations for flagged anomalies • Implement a blockchain-based digital signature for each integrity check • Support multiple shipment types (e.g., pharmaceuticals, electronics) with different risk profiles

Functional Requirements:
- The mobile app must display shipment status and integrity score based on blockchain and GPS data
- The system must detect anomalies in GPS trajectory using ML models trained on historical data
- Anomalies must trigger alerts with metadata (time, location, risk level)
- All user interactions must be authenticated via a cybersecurity-implemented identity system
- The blockchain must store a timestamped record of each integrity check and alert
- The app must show the blockchain audit trail for any flagged event
- The backend must reconcile blockchain and mobile data sources in real-time

Non-Functional Requirements:
- End-to-end integrity check latency ≤ 3 seconds
- Mobile app must load in ≤ 5 seconds on a mid-tier Android device
- Blockchain transaction finality must be confirmed within 10 seconds
- System must prevent replay attacks and unauthorized access
- ML model inference must complete within 2 seconds per shipment update

Constraints:
- All components must be built and deployed within 6 hours
- No external APIs or third-party services beyond test blockchain and cloud
- The blockchain must be a testnet (e.g., Ethereum Goerli or Polygon Mumbai)
- No use of pre-trained models — ML must be trained or adapted in the 6-hour window
- All cybersecurity measures must be implemented in code, not just documented
- The MVP must be demoable on a single mobile device

Deliverables:
- A working mobile app with integrity score and alerts
- A deployed blockchain contract storing audit logs
- A trained ML model detecting GPS anomalies
- A demo video showing anomaly detection and blockchain verification
- A live demo on a mobile device during judging
