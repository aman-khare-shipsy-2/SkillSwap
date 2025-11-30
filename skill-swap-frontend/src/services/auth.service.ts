import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, AuthResponse, LoginData, RegisterData } from '../types';

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data.data!;
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.LOGIN,
      data
    );
    return response.data.data!;
  },
};

