import baseApi from '../../shared/services/api/baseApi';
import { 
  LoginCredentials, 
  SignupCredentials, 
  TokenResponse, 
  UserPublic, 
  RefreshRequest 
} from './types/auth';

const authApi = {
  /**
   * User login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const form = new URLSearchParams();
    form.append('username', credentials.username);
    form.append('password', credentials.password);
    
    const response = await baseApi.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return response.data;
  },

  /**
   * User registration with email and password
   */
  signup: async (userData: Omit<SignupCredentials, 'confirmPassword'>): Promise<UserPublic> => {
    const response = await baseApi.post('/auth/signup', {
      email: userData.email,
      password: userData.password
    });
    
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await baseApi.post('/auth/refresh', {
      refresh_token: refreshToken
    });
    
    return response.data;
  },

  /**
   * Store tokens in localStorage
   */
  storeTokens: (tokens: TokenResponse) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_type', tokens.token_type);
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Clear stored tokens
   */
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  }
};

export default authApi;
