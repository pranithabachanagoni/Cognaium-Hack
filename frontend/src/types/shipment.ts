export type ShipmentStatus =
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'DELAYED';

export type RiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

export interface Shipment {
  id: string;
  type: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  integrityScore: number;
  riskLevel: RiskLevel;
  currentLocation: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  reason: string;
  riskLevel: RiskLevel;
  timestamp: string;
  location: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  score: number;
  riskLevel: RiskLevel;
  reason: string;
  transactionHash: string;
}
