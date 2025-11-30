import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, User, Analytics } from '../types';

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.GET_PROFILE);
    return response.data.data!;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(
      API_ENDPOINTS.UPDATE_PROFILE,
      data
    );
    return response.data.data!;
  },

  // Add offered skill
  addOfferedSkill: async (skillId: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      API_ENDPOINTS.ADD_OFFERED_SKILL,
      { skillId }
    );
    return response.data.data!;
  },

  // Remove offered skill
  removeOfferedSkill: async (skillId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.REMOVE_OFFERED_SKILL}/${skillId}`);
  },

  // Add desired skill
  addDesiredSkill: async (skillId: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>(
      API_ENDPOINTS.ADD_DESIRED_SKILL,
      { skillId }
    );
    return response.data.data!;
  },

  // Remove desired skill
  removeDesiredSkill: async (skillId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.REMOVE_DESIRED_SKILL}/${skillId}`);
  },

  // Get user analytics
  getAnalytics: async (): Promise<Analytics> => {
    const response = await api.get<ApiResponse<Analytics>>(
      API_ENDPOINTS.GET_ANALYTICS
    );
    return response.data.data!;
  },
};

