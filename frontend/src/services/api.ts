import { Shipment } from '../types/shipment';
import { mockShipments } from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  getShipments: async (): Promise<Shipment[]> => {
    await delay(600); // Simulate API latency
    return [...mockShipments];
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    await delay(1200); // Simulate secure identity authentication check
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password' };
    }
    // Basic validation for mock authentication
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }
    return { success: true, token: 'mock-session-token-chaintrace-jwt' };
  },
};
