import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, Rating } from '../types';

interface UserRatings {
  given: Rating[];
  received: Rating[];
  averageRating: number;
  totalRatings: number;
}

export const ratingService = {
  // Create rating
  createRating: async (data: {
    chatSessionId?: string;
    ratedUserId: string;
    skillId: string;
    score: number;
    comment?: string;
    sessionId?: string;
  }): Promise<Rating> => {
    const payload: any = {
      ratedUserId: data.ratedUserId,
      skillId: data.skillId,
      score: data.score,
    };
    
    if (data.comment) {
      payload.comment = data.comment;
    }
    
    if (data.sessionId || data.chatSessionId) {
      payload.sessionId = data.sessionId || data.chatSessionId;
    }
    
    console.log('Rating service - sending payload:', payload);
    
    try {
      const response = await api.post<ApiResponse<Rating>>(
        API_ENDPOINTS.CREATE_RATING,
        payload
      );
      console.log('Rating service - success response:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('Rating service - error:', error);
      console.error('Rating service - error response:', error?.response);
      throw error;
    }
  },

  // Get user's ratings
  getMyRatings: async (): Promise<UserRatings> => {
    const response = await api.get<ApiResponse<UserRatings>>(
      API_ENDPOINTS.GET_MY_RATINGS
    );
    return response.data.data!;
  },

  // Get rating by ID
  getRatingById: async (ratingId: string): Promise<Rating> => {
    const response = await api.get<ApiResponse<Rating>>(
      `${API_ENDPOINTS.GET_RATING}/${ratingId}`
    );
    return response.data.data!;
  },
};

