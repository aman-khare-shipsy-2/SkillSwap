import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, Skill } from '../types';

interface PaginatedSkills {
  skills: Skill[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  pages?: number;
}

export const skillService = {
  // Get all skills
  getAllSkills: async (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedSkills> => {
    const response = await api.get<ApiResponse<Skill[]>>(API_ENDPOINTS.GET_SKILLS, {
      params,
    });
    const pagination = response.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 };
    return {
      skills: response.data.data || [],
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: (pagination as { pages?: number; totalPages?: number }).pages || (pagination as { pages?: number; totalPages?: number }).totalPages || 1,
    };
  },

  // Get skill by ID
  getSkillById: async (skillId: string): Promise<Skill> => {
    const response = await api.get<ApiResponse<Skill>>(
      `${API_ENDPOINTS.GET_SKILL}/${skillId}`
    );
    return response.data.data!;
  },

  // Create skill
  createSkill: async (data: {
    name: string;
    category: string;
    description?: string;
  }): Promise<Skill> => {
    const response = await api.post<ApiResponse<Skill>>(
      API_ENDPOINTS.CREATE_SKILL,
      data
    );
    return response.data.data!;
  },

  // Update skill
  updateSkill: async (skillId: string, data: Partial<Skill>): Promise<Skill> => {
    const response = await api.put<ApiResponse<Skill>>(
      `${API_ENDPOINTS.UPDATE_SKILL}/${skillId}`,
      data
    );
    return response.data.data!;
  },

  // Delete skill
  deleteSkill: async (skillId: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.DELETE_SKILL}/${skillId}`);
  },
};

