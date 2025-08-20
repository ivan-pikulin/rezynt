import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenResponse } from '../../features/auth/types/auth';
import { tokenService } from '../services/api/tokenService';
import { User } from '../services/api/types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (tokens: TokenResponse) => void;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Проверяем токены при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const accessToken = tokenService.getAccessToken();
        const refreshToken = tokenService.getRefreshToken();

        console.log('Access token exists:', !!accessToken);
        console.log('Refresh token exists:', !!refreshToken);

        if (!accessToken || !refreshToken) {
          console.log('No tokens found, user not authenticated');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Проверяем, не истек ли access token
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;

        console.log('Token expiration:', new Date(tokenData.exp * 1000));
        console.log('Current time:', new Date(currentTime * 1000));

        if (tokenData.exp < currentTime) {
          console.log('Access token expired, attempting refresh');
          // Access token истек, пытаемся обновить
          const success = await refreshTokens();
          if (!success) {
            console.log('Token refresh failed');
            tokenService.clearTokens();
            setIsAuthenticated(false);
          } else {
            console.log('Token refresh successful');
          }
        } else {
          console.log('Access token is valid');
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        tokenService.clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const newTokens = await tokenService.refreshToken(refreshToken);
      tokenService.storeTokens(newTokens);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenService.clearTokens();
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const login = useCallback((tokens: TokenResponse) => {
    console.log('Login function called with tokens');
    tokenService.storeTokens(tokens);
    console.log('Tokens stored in localStorage');
    setIsAuthenticated(true);
    console.log('isAuthenticated set to true');
  }, []);

  const logout = useCallback(() => {
    tokenService.clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/auth');
  }, [navigate]);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshTokens,
    updateUser,
  };
};
