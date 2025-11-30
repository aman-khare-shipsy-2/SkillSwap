import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, VerificationTest } from '../types';

export const verificationService = {
  // Start verification test
  startTest: async (skillId: string): Promise<VerificationTest> => {
    const response = await api.post<ApiResponse<VerificationTest>>(
      API_ENDPOINTS.START_TEST,
      { skillId }
    );
    return response.data.data!;
  },

  // Submit test answers
  submitTest: async (data: {
    testId: string;
    answers: Array<{ questionIndex: number; answer: string | number }>;
  }): Promise<VerificationTest> => {
    const response = await api.post<ApiResponse<VerificationTest>>(
      API_ENDPOINTS.SUBMIT_TEST,
      data
    );
    return response.data.data!;
  },

  // Get verification status
  getTestStatus: async (): Promise<VerificationTest[]> => {
    const response = await api.get<ApiResponse<VerificationTest[]>>(
      API_ENDPOINTS.GET_TEST_STATUS
    );
    return response.data.data || [];
  },

  // Get test by ID
  getTestById: async (testId: string): Promise<VerificationTest> => {
    const response = await api.get<ApiResponse<VerificationTest>>(
      `${API_ENDPOINTS.GET_TEST}/${testId}`
    );
    return response.data.data!;
  },
};

