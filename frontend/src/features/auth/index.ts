// Export auth pages
export { default as Login } from './pages/Login';
export { default as Signup } from './pages/Signup';

// Export auth hooks
export { useAuth } from './hooks/useAuth';
export type { AuthError } from './hooks/useAuth';
export { usePasswordVisibility } from './hooks/usePasswordVisibility';

// Export auth services
export { authService } from './services/authService'; 