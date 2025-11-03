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



  // Check tokens on load
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const checkAuth = async () => {
      try {
        hasInitialized.current = true;
        const accessToken = tokenService.getAccessToken();
        const refreshToken = tokenService.getRefreshToken();

        if (!accessToken || !refreshToken) {
          // No tokens - create guest session
          console.log('No tokens found, creating guest session...');
          try {
            const { authApi } = await import('../services/api');
            const guestTokens = await authApi.createGuestSession();
            tokenService.storeTokens(guestTokens);
            setIsAuthenticated(true);
            
            // Load guest user data
            const userData = await userApi.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Error creating guest session:', error);
            setIsAuthenticated(false);
            setUser(null);
          }
          setIsLoading(false);
          return;
        }

        // Check if access token has expired
        const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (tokenData.exp < currentTime) {
          // Access token expired, try to refresh
          const success = await refreshTokens();
          if (!success) {
            // Refresh failed - create new guest session
            console.log('Token refresh failed, creating new guest session...');
            try {
              const { authApi } = await import('../services/api');
              const guestTokens = await authApi.createGuestSession();
              tokenService.storeTokens(guestTokens);
              setIsAuthenticated(true);
              
              const userData = await userApi.getCurrentUser();
              setUser(userData);
            } catch (error) {
              console.error('Error creating guest session:', error);
              tokenService.clearTokens();
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } else {
          setIsAuthenticated(true);
          // Token is valid, load user data
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
        setUser(null);
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
      // Load user data after token refresh
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
    // Load user data after login
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
    navigate('/login');
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
