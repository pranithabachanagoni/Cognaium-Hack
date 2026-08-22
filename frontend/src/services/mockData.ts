import { Shipment, Alert, AuditRecord } from '../types/shipment';

export const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    type: 'Pharmaceuticals',
    origin: 'Hyderabad',
    destination: 'Mumbai',
    status: 'IN_TRANSIT',
    integrityScore: 9,
    riskLevel: 'LOW',
    currentLocation: 'Hyderabad',
    lastUpdated: '12:04:31',
  },
  {
    id: 'SHP-002',
    type: 'Electronics',
    origin: 'Bengaluru',
    destination: 'Delhi',
    status: 'IN_TRANSIT',
    integrityScore: 7,
    riskLevel: 'MEDIUM',
    currentLocation: 'Anantapur',
    lastUpdated: '11:58:12',
  },
  {
    id: 'SHP-003',
    type: 'Pharmaceuticals',
    origin: 'Chennai',
    destination: 'Pune',
    status: 'DELIVERED',
    integrityScore: 10,
    riskLevel: 'LOW',
    currentLocation: 'Pune',
    lastUpdated: '09:15:00',
  },
  {
    id: 'SHP-004',
    type: 'High-Value Chemicals',
    origin: 'Kolkata',
    destination: 'Ahmedabad',
    status: 'DELAYED',
    integrityScore: 3,
    riskLevel: 'HIGH',
    currentLocation: 'Varanasi',
    lastUpdated: '12:10:45',
  },
];

export const mockAlerts: Record<string, Alert[]> = {
  'SHP-001': [],
  'SHP-002': [
    {
      id: 'ALT-201',
      type: 'REROUTE_DEVIATION',
      title: 'Geofence Deviation Warning',
      reason: 'Slight route deviation detected to bypass heavy traffic on highway NH-44.',
      riskLevel: 'MEDIUM',
      timestamp: '11:45:00',
      location: 'Bengaluru Outskirts',
    },
  ],
  'SHP-003': [],
  'SHP-004': [
    {
      id: 'ALT-401',
      type: 'GPS_ANOMALY',
      title: 'GPS Trajectory Anomaly',
      reason: 'Sudden GPS displacement detected. Telemetry coordinates jump exceeded model thresholds.',
      riskLevel: 'HIGH',
      timestamp: '12:04:31',
      location: 'Hyderabad Outskirts', // (Wait, example: "Location Hyderabad 12:04:31")
    },
    {
      id: 'ALT-402',
      type: 'IDENTITY_SPOOFING',
      title: 'Validation Spoofing Attempt',
      reason: 'Cryptographic handshake signature mismatch detected from mobile device terminal.',
      riskLevel: 'HIGH',
      timestamp: '11:50:22',
      location: 'Varanasi Warehouse',
    },
  ],
};

export const mockAudits: Record<string, AuditRecord[]> = {
  'SHP-001': [
    {
      id: 'AUD-101',
      timestamp: '12:04:31',
      score: 9,
      riskLevel: 'LOW',
      reason: 'Routine integrity check passed. On-chain validation verified signature.',
      transactionHash: '0x3f5c9e4210a7b5d19a2b8e3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    },
    {
      id: 'AUD-102',
      timestamp: '10:00:00',
      score: 9,
      riskLevel: 'LOW',
      reason: 'Origin departure check complete. Security seals activated.',
      transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
  ],
  'SHP-002': [
    {
      id: 'AUD-201',
      timestamp: '11:58:12',
      score: 7,
      riskLevel: 'MEDIUM',
      reason: 'Geofence warning logged on-chain. Cargo remains sealed.',
      transactionHash: '0x62e84c93fa110de93c8b4f492b7c6d5e4f3a2b109876543210abcdef09872cde',
    },
  ],
  'SHP-003': [
    {
      id: 'AUD-301',
      timestamp: '09:15:00',
      score: 10,
      riskLevel: 'LOW',
      reason: 'Final delivery checklist signed on-chain by receiver cryptographic key.',
      transactionHash: '0x8f7d6e5c4b3a2f1e0d9c8b7a6d5e4f3c2b1a09876543210abcdef1234567890a',
    },
  ],
  'SHP-004': [
    {
      id: 'AUD-401',
      timestamp: '12:04:31',
      score: 3,
      riskLevel: 'HIGH',
      reason: 'GPS trajectory anomaly',
      transactionHash: '0x83e29f8c6b4d3a21e0f9c8b7a6d5e4f3c2b1a09876543210abcdefab91AFb2cd',
    },
    {
      id: 'AUD-402',
      timestamp: '11:50:22',
      score: 5,
      riskLevel: 'MEDIUM',
      reason: 'Identity validation failure - telemetry spoofing attempt detected.',
      transactionHash: '0x74d3c2b1a09876543210abcdef9876543210abcdef1234567890abcdef123456',
    },
    {
      id: 'AUD-403',
      timestamp: '08:00:00',
      score: 10,
      riskLevel: 'LOW',
      reason: 'Shipment initiated at Kolkata. Identity verification verified.',
      transactionHash: '0x09876543210abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
  ],
};
