import { Shipment, Alert, AuditRecord, ShipmentStatus, RiskLevel } from '../types/shipment';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

let authToken: string | null = null;

const getHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  getShipments: async (): Promise<Shipment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch shipments');
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.shipment_id,
        type: item.shipment_type,
        origin: 'Unknown',
        destination: 'Unknown',
        status: item.status as ShipmentStatus,
        integrityScore: item.integrity_score,
        riskLevel: item.risk_level as RiskLevel,
        currentLocation: 'Unknown',
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.error('getShipments error:', e);
      return [];
    }
  },

  getShipment: async (id: string): Promise<Shipment | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch shipment details');
      const item = await response.json();
      return {
        id: item.shipment_id,
        type: item.shipment_type,
        origin: 'Unknown',
        destination: 'Unknown',
        status: item.status as ShipmentStatus,
        integrityScore: item.integrity_score,
        riskLevel: item.risk_level as RiskLevel,
        currentLocation: item.current_location ? `${item.current_location.latitude.toFixed(4)}, ${item.current_location.longitude.toFixed(4)}` : 'Unknown',
        lastUpdated: item.last_update
      };
    } catch (e) {
      console.error('getShipment error:', e);
      return undefined;
    }
  },

  getAlerts: async (id: string): Promise<Alert[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}/alerts`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id.toString(),
        type: item.alert_type,
        title: item.alert_type.replace(/_/g, ' '),
        reason: item.message,
        riskLevel: item.risk_level as RiskLevel,
        timestamp: item.timestamp,
        location: item.latitude && item.longitude ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : 'Unknown location'
      }));
    } catch (e) {
      console.error('getAlerts error:', e);
      return [];
    }
  },

  getAudit: async (id: string): Promise<AuditRecord[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shipments/${id}/audit`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch audit records');
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id.toString(),
        timestamp: item.timestamp,
        score: item.integrity_score,
        riskLevel: (item.integrity_score < 7.0 ? 'HIGH' : item.integrity_score < 9.0 ? 'MEDIUM' : 'LOW') as RiskLevel,
        reason: item.event_type,
        transactionHash: item.tx_hash || 'Pending'
      }));
    } catch (e) {
      console.error('getAudit error:', e);
      return [];
    }
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: email.split('@')[0] || email,
          password 
        })
      });
      if (!response.ok) {
        return { success: false, error: 'Invalid credentials' };
      }
      const data = await response.json();
      authToken = data.access_token; // Store token for subsequent requests
      return { success: true, token: data.access_token };
    } catch (e) {
      console.error('signIn error:', e);
      return { success: false, error: 'Network error. Is backend running?' };
    }
  },
  
  logout: () => {
    authToken = null;
  }
};
