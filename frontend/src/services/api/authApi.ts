import baseApi from './baseApi';
import { UserLogin, UserSignup } from './types';

/**
 * Authentication API service for handling login/signup operations
 */
const authApi = {
  /**
   * Login with username and password
   */
  login: async (credentials: UserLogin) => {
    const form = new URLSearchParams();
    form.append('username', credentials.username);
    form.append('password', credentials.password);
    
    const response = await baseApi.post('/auth/login/', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return response.data;
  },
  
  /**
   * Register a new user and automatically login
   */
  signup: async (userData: UserSignup) => {
    // First register the user
    const signupResponse = await baseApi.post('/auth/signup/', userData);
    
    // Then automatically login
    const loginResponse = await authApi.login({
      username: userData.username,
      password: userData.password
    });
    
    return loginResponse;
  },
  
  /**
   * Logout the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default authApi; 