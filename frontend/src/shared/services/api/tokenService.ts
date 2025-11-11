import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { TokenResponse } from '../../../features/auth/types/auth';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const tokenService = {
  getAccessToken: (): string | null => {
    const token = localStorage.getItem('access_token');
    return token;
  },

  getRefreshToken: (): string | null => {
    const token = localStorage.getItem('refresh_token');
    return token;
  },

  getGuestId: (): string | null => {
    return localStorage.getItem('guest_id');
  },

  setGuestId: (guestId: string) => {
    localStorage.setItem('guest_id', guestId);
  },

  getOrCreateGuestId: async (): Promise<string> => {
    const existingGuestId = localStorage.getItem('guest_id');
    if (existingGuestId) {
      return existingGuestId;
    }

    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const guestId = result.visitorId;
      localStorage.setItem('guest_id', guestId);
      return guestId;
    } catch (error) {
      const guestId = generateUUID();
      localStorage.setItem('guest_id', guestId);
      return guestId;
    }
  },

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
  },

  storeTokens: (tokens: TokenResponse) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_type', tokens.token_type);
    if (tokens.guest_id) {
      localStorage.setItem('guest_id', tokens.guest_id);
    }
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return response.json();
  },
};
