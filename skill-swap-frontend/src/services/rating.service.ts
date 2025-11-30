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
    chatSessionId: string;
    ratedUserId: string;
    rating: number;
    comment?: string;
  }): Promise<Rating> => {
    const response = await api.post<ApiResponse<Rating>>(
      API_ENDPOINTS.CREATE_RATING,
      data
    );
    return response.data.data!;
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

