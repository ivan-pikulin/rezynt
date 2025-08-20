import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18next from 'i18next';
import { tokenService } from './tokenService';

const apiUrl = import.meta.env.VITE_API_URL;

const baseApi = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure HTTPS
  withCredentials: true
});

// Add request interceptor for authentication
baseApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    console.log('Request interceptor - token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    }
    // Ensure HTTPS
    if (config.url && config.url.startsWith('http:')) {
      config.url = config.url.replace('http:', 'https:');
    }
    // Don't set Content-Type for FormData, let the browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    throw error;
  }
);

// Helper to map status codes to i18n keys
const statusCodeToI18nKey = (status: number) => {
  switch (status) {
    case 400: return 'error.bad_request';
    case 401: return 'error.unauthorized';
    case 403: return 'error.forbidden';
    case 404: return 'error.not_found';
    case 409: return 'error.conflict';
    case 422: return 'error.unprocessable';
    case 500: return 'error.internal';
    default: return 'error.unexpected';
  }
};

// Notification helper for non-component usage
let notify: ((msg: string, severity?: 'error' | 'success' | 'info') => void) | null = null;
export const setGlobalNotification = (cb: typeof notify) => { notify = cb; };
function showGlobalNotification(msg: string, severity: 'error' | 'success' | 'info' = 'error') {
  if (notify) notify(msg, severity);
}

// Add response interceptor for error handling
baseApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
          const newTokens = await tokenService.refreshToken(refreshToken);
          tokenService.storeTokens(newTokens);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return baseApi(originalRequest);
        }
      } catch (refreshError) {
        // Если refresh не удался, очищаем токены и редиректим на авторизацию
        tokenService.clearTokens();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // Show notification for all other errors
    const status = error.response?.status;
    const i18nKey = statusCodeToI18nKey(status);
    let message = error.response?.data?.detail;
    if (Array.isArray(message)) {
      message = message.map((item: any) => item.msg || JSON.stringify(item)).join('; ');
    } else if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message);
    }
    if (!message) {
      message = i18next.t(i18nKey);
    }
    showGlobalNotification(message, 'error');
    throw error;
  }
);

// Base API class for extending
export class BaseApi {
  protected api = baseApi;

  protected async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  protected async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export default baseApi; 