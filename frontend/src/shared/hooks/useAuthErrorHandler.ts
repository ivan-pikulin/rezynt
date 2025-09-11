import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * Hook for handling authentication errors (401) across the application
 * Provides a centralized way to handle unauthorized access and redirect to login
 */
export const useAuthErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleAuthError = useCallback((error: any) => {
    // Check if it's a 401 error
    if (error?.response?.status === 401 || error?.status === 401) {
      // Clear authentication state and redirect to login
      logout();
      return true; // Indicates that the error was handled
    }
    return false; // Error was not handled
  }, [logout]);

  return { handleAuthError };
};
