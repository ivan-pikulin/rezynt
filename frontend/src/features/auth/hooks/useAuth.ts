import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from 'shared/types/user';
import userApi from 'services/api/userApi';

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UseAuthReturn {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<AuthResponse | null>;
  signup: (username: string, password: string) => Promise<AuthResponse | null>;
  logout: () => void;
  isAuthenticated: () => boolean;
  loading: boolean;
  error: AuthError | null;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await userApi.getCurrentUser();
          setCurrentUser(user);
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      }
    };
    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(username, password);
      const user = await userApi.getCurrentUser();
      setCurrentUser(user);
      navigate('/');
      return response;
    } catch (err: any) {
      setError({ 
        message: err.response?.data?.detail || 'Login failed' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(username, password);
      return response;
    } catch (err: any) {
      setError({ 
        message: err.response?.data?.detail || 'Signup failed' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  return {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated,
    loading,
    error
  };
}; 