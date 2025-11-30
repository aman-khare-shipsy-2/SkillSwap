import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, SkillRequest, User } from '../types';

interface UserRequests {
  sent: SkillRequest[];
  received: SkillRequest[];
}

interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  pages?: number;
}

export const requestService = {
  // Create skill exchange request
  createRequest: async (data: {
    receiverId: string;
    offeredSkillId: string;
    requestedSkillId: string;
    message?: string;
  }): Promise<SkillRequest> => {
    const response = await api.post<ApiResponse<SkillRequest>>(
      API_ENDPOINTS.CREATE_REQUEST,
      data
    );
    return response.data.data!;
  },

  // Get user's requests
  getMyRequests: async (status?: string): Promise<UserRequests> => {
    const response = await api.get<ApiResponse<UserRequests>>(
      API_ENDPOINTS.GET_MY_REQUESTS,
      { params: status ? { status } : {} }
    );
    return response.data.data!;
  },

  // Search users for skill exchange
  searchUsers: async (params: {
    requestedSkillId: string;
    offeredSkillIds: string | string[]; // Changed to accept array or comma-separated string
    page?: number;
    limit?: number;
  }): Promise<PaginatedUsers> => {
    // Convert array to comma-separated string if needed for query params
    const queryParams: any = {
      requestedSkillId: params.requestedSkillId,
      page: params.page,
      limit: params.limit,
    };
    
    if (Array.isArray(params.offeredSkillIds)) {
      queryParams.offeredSkillIds = params.offeredSkillIds.join(',');
    } else {
      queryParams.offeredSkillIds = params.offeredSkillIds;
    }
    
    const response = await api.get<ApiResponse<User[]>>(
      API_ENDPOINTS.SEARCH_USERS,
      { params: queryParams }
    );
    const pagination = response.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 };
    return {
      users: response.data.data || [],
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: (pagination as { pages?: number; totalPages?: number }).pages || (pagination as { pages?: number; totalPages?: number }).totalPages || 1,
    };
  },

  // Accept request
  acceptRequest: async (requestId: string): Promise<SkillRequest> => {
    const response = await api.post<ApiResponse<SkillRequest>>(
      `${API_ENDPOINTS.ACCEPT_REQUEST}/${requestId}/accept`
    );
    return response.data.data!;
  },

  // Reject request
  rejectRequest: async (requestId: string): Promise<SkillRequest> => {
    const response = await api.post<ApiResponse<SkillRequest>>(
      `${API_ENDPOINTS.REJECT_REQUEST}/${requestId}/reject`
    );
    return response.data.data!;
  },

  // Forfeit request
  forfeitRequest: async (requestId: string): Promise<SkillRequest> => {
    const response = await api.post<ApiResponse<SkillRequest>>(
      `${API_ENDPOINTS.FORFEIT_REQUEST}/${requestId}/forfeit`
    );
    return response.data.data!;
  },
};

