import baseApi from '../../shared/services/api/baseApi';
import { tokenService } from '../../shared/services/api/tokenService';
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
    tokenService.storeTokens(tokens);
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return tokenService.getAccessToken();
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    return tokenService.getRefreshToken();
  },

  /**
   * Clear stored tokens
   */
  clearTokens: () => {
    tokenService.clearTokens();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenService.getAccessToken();
  }
};

export default authApi;
