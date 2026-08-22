import { Shipment } from '../types/shipment';

export const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    type: 'Pharmaceuticals',
    origin: 'Hyderabad',
    destination: 'Mumbai',
    status: 'IN_TRANSIT',
    integrityScore: 9,
    riskLevel: 'LOW',
  },
  {
    id: 'SHP-002',
    type: 'Electronics',
    origin: 'Bengaluru',
    destination: 'Delhi',
    status: 'IN_TRANSIT',
    integrityScore: 7,
    riskLevel: 'MEDIUM',
  },
  {
    id: 'SHP-003',
    type: 'Pharmaceuticals',
    origin: 'Chennai',
    destination: 'Pune',
    status: 'DELIVERED',
    integrityScore: 10,
    riskLevel: 'LOW',
  },
  {
    id: 'SHP-004',
    type: 'High-Value Chemicals',
    origin: 'Kolkata',
    destination: 'Ahmedabad',
    status: 'DELAYED',
    integrityScore: 3,
    riskLevel: 'HIGH',
  },
];
