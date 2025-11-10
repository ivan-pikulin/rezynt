import { TokenResponse } from '../../../features/auth/types/auth';

export const tokenService = {
  getAccessToken: (): string | null => {
    const token = localStorage.getItem('access_token');
    return token;
  },

  getRefreshToken: (): string | null => {
    const token = localStorage.getItem('refresh_token');
    return token;
  },

  /**
   * Get guest_id from localStorage.
   * This ID persists across sessions to track returning guests.
   */
  getGuestId: (): string | null => {
    return localStorage.getItem('guest_id');
  },

  setGuestId: (guestId: string) => {
    localStorage.setItem('guest_id', guestId);
  },

  /**
   * Clear authentication tokens but always preserve guest_id.
   * Guest ID should never be cleared to track returning users across all sessions.
   */
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    // Never remove guest_id - it persists forever to track returning guests
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
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
