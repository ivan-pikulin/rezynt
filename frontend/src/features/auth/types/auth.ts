// Re-export from centralized types for backward compatibility
export type {
  LoginCredentials,
  SignupCredentials,
  TokenResponse,
  User as UserPublic,
  RefreshRequest
} from '../../../shared/services/api/types';

export interface AuthError {
  error?: string;
}

export type AuthMode = 'login' | 'signup';

export interface EmailConfirmationParams {
  status: 'success' | 'error';
  message?: string;
  error?: string;
}
