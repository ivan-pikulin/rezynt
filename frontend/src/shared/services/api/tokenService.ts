import { TokenResponse } from '../../../features/auth/types/auth';

export const tokenService = {
  getAccessToken: (): string | null => {
    const token = localStorage.getItem('access_token');
    console.log('tokenService.getAccessToken called, token exists:', !!token);
    return token;
  },

  getRefreshToken: (): string | null => {
    const token = localStorage.getItem('refresh_token');
    console.log('tokenService.getRefreshToken called, token exists:', !!token);
    return token;
  },

  clearTokens: () => {
    console.log('tokenService.clearTokens called');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
  },

  storeTokens: (tokens: TokenResponse) => {
    console.log('tokenService.storeTokens called with tokens:', {
      access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'null',
      refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'null',
      token_type: tokens.token_type
    });
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_type', tokens.token_type);
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    console.log('tokenService.refreshToken called');
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
