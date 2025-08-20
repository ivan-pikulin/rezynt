import { BaseApi } from './baseApi';
import { 
  LoginCredentials, 
  SignupCredentials, 
  TokenResponse, 
  User, 
  RefreshRequest 
} from './types';
import { tokenService } from './tokenService';

export class AuthApi extends BaseApi {
  /**
   * User login with email and password
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const form = new URLSearchParams();
    form.append('username', credentials.username);
    form.append('password', credentials.password);
    
    const response = await this.api.post<TokenResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return response.data;
  }

  /**
   * User registration with email and password
   */
  async signup(userData: Omit<SignupCredentials, 'confirmPassword'>): Promise<User> {
    return this.post<User>('/auth/signup', {
      email: userData.email,
      password: userData.password
    });
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return this.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });
  }

  /**
   * Store tokens in localStorage
   */
  storeTokens(tokens: TokenResponse): void {
    tokenService.storeTokens(tokens);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return tokenService.getAccessToken();
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return tokenService.getRefreshToken();
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    tokenService.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenService.getAccessToken();
  }
}

export const authApi = new AuthApi(); 