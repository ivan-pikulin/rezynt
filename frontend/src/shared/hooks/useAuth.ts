import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenResponse } from '../../features/auth/types/auth';
import { tokenService } from '../services/api/tokenService';
import { userApi } from '../services/api';
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
  const hasInitialized = useRef(false);



  // Проверяем токены при загрузке
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const checkAuth = async () => {
      try {
        hasInitialized.current = true;
        const accessToken = tokenService.getAccessToken();
        const refreshToken = tokenService.getRefreshToken();

        if (!accessToken || !refreshToken) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Проверяем, не истек ли access token
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenData.exp < currentTime) {
          // Access token истек, пытаемся обновить
          const success = await refreshTokens();
          if (!success) {
            tokenService.clearTokens();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
          // Токен валиден, загружаем данные пользователя
          try {
            const userData = await userApi.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Error loading user data:', error);
            tokenService.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
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
      // Загружаем данные пользователя после обновления токена
      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data after token refresh:', error);
        tokenService.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenService.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  const login = useCallback(async (tokens: TokenResponse) => {
    tokenService.storeTokens(tokens);
    setIsAuthenticated(true);
    // Загружаем данные пользователя после логина
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data after login:', error);
      tokenService.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
    }
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
