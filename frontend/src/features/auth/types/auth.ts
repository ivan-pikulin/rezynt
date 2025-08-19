export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserPublic {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface AuthError {
  detail: string;
  status_code: number;
}

export type AuthMode = 'login' | 'signup';

export interface EmailConfirmationParams {
  status: 'success' | 'error';
  message?: string;
  error?: string;
}
