import { BaseApi } from './baseApi';
import { 
  LoginCredentials, 
  SignupCredentials, 
  Resume,
  TokenResponse, 
  User, 
  RefreshRequest 
} from './types';
import { tokenService } from './tokenService';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface EmailVerificationByCode {
  email: string;
  code: string;
}

export interface PasswordResetByCode {
  email: string;
  code: string;
  new_password: string;
}

export interface ResendVerificationCode {
  email: string;
  code_type: 'email_confirm' | 'password_reset';
}

export interface GoogleLoginRequest {
  id_token: string;
  guest_id?: string;
}

export interface LandingSignupRequest {
  email: string;
  resume_data: Resume;
}

export class AuthApi extends BaseApi {
  /**
   * Create a guest session
   */
  async createGuestSession(): Promise<TokenResponse> {
    return this.post<TokenResponse>('/auth/guest', {});
  }

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
   * Login or signup with Google ID token
   */
  async loginWithGoogle(request: GoogleLoginRequest): Promise<TokenResponse> {
    return this.post<TokenResponse>('/auth/google', request);
  }

  /**
   * User registration with email and password
   */
  async signup(userData: { email: string; password: string; temp_file_id?: string; guest_id?: string }): Promise<User> {
    const requestData = {
      email: userData.email,
      password: userData.password,
      temp_file_id: userData.temp_file_id,
      guest_id: userData.guest_id
    };
    
    console.log('AuthApi.signup - sending request:', requestData);
    
    return this.post<User>('/auth/signup', requestData);
  }

  /**
   * Create and authenticate a full account from the landing questionnaire.
   */
  async signupFromLanding(request: LandingSignupRequest): Promise<TokenResponse> {
    return this.post<TokenResponse>('/auth/landing-signup', request);
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
   * Request password reset via email
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/request-password-reset', request);
  }

  /**
   * Reset password using token from email
   */
  async resetPassword(confirm: PasswordResetConfirm): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/reset-password', confirm);
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

  /**
   * Confirm email using 6-digit verification code
   */
  async confirmEmailByCode(request: EmailVerificationByCode): Promise<TokenResponse> {
    return this.post<TokenResponse>('/auth/confirm-email-by-code', request);
  }

  /**
   * Reset password using 6-digit verification code
   */
  async resetPasswordByCode(request: PasswordResetByCode): Promise<{ message: string }> {
    return this.post<{ message: string }>('/auth/reset-password-by-code', request);
  }

  /**
   * Resend verification code
   */
  async resendVerificationCode(request: ResendVerificationCode): Promise<{ message: string; token?: string }> {
    return this.post<{ message: string; token?: string }>('/auth/resend-verification-code', request);
  }
}

export const authApi = new AuthApi(); 
