import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import i18next from 'i18next';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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

export default baseApi; 