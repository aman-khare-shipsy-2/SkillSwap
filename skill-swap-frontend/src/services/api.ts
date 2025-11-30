import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };

      // Handle 401 Unauthorized - Clear auth and redirect to login
      if (status === 401) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Handle 403 Forbidden
      if (status === 403) {
        toast.error('Access forbidden.');
        return Promise.reject(error);
      }

      // Handle 404 Not Found
      if (status === 404) {
        toast.error(data.message || 'Resource not found.');
        return Promise.reject(error);
      }

      // Handle 429 Too Many Requests
      if (status === 429) {
        toast.error('Too many requests. Please try again later.');
        return Promise.reject(error);
      }

      // Handle other errors
      const errorMessage = data.message || data.error || 'An error occurred';
      toast.error(errorMessage);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;

