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
}
