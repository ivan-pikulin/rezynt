import baseApi from './baseApi';
import { UserLogin, UserSignup } from './types';

const authApi = {
  login: async (credentials: UserLogin) => {
    const form = new URLSearchParams();
    form.append('username', credentials.username);
    form.append('password', credentials.password);
    
    const response = await baseApi.post('/auth/login/', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    return response.data;
  },

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