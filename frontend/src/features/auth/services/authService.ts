import { authApi } from 'services/api';

/**
 * Authentication service that encapsulates auth logic
 */
export const authService = {
  /**
   * Login with username and password
   */
  login: async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    localStorage.setItem('token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    return response;
  },
  
  /**
   * Register a new user
   */
  signup: async (username: string, password: string) => {
    const response = await authApi.signup({ username, password });
    localStorage.setItem('token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    return response;
  },
  
  /**
   * Logout the current user
   */
  logout: () => authApi.logout(),
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
}; 