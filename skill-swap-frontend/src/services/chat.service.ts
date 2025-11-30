import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, ChatSession, Message } from '../types';

export const chatService = {
  // Get user's chat sessions
  getMyChats: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ChatSession[]> => {
    const response = await api.get<ApiResponse<ChatSession[]>>(
      API_ENDPOINTS.GET_MY_CHATS,
      { params }
    );
    return response.data.data || [];
  },

  // Get chat session by ID
  getChatSession: async (
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ChatSession> => {
    const response = await api.get<ApiResponse<ChatSession>>(
      `${API_ENDPOINTS.GET_CHAT}/${chatId}`,
      { params }
    );
    return response.data.data!;
  },

  // Send message
  sendMessage: async (
    chatId: string,
    data: {
      type: 'text' | 'image' | 'video' | 'document' | 'link';
      text?: string;
      contentURL?: string;
    },
    file?: File
  ): Promise<Message> => {
    const formData = new FormData();
    formData.append('type', data.type);
    if (data.text) formData.append('text', data.text);
    if (file) formData.append('file', file);
    if (data.contentURL) formData.append('contentURL', data.contentURL);

    const response = await api.post<ApiResponse<Message>>(
      `${API_ENDPOINTS.SEND_MESSAGE}/${chatId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  // Upload file
  uploadFile: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string; filename: string }>>(
      API_ENDPOINTS.UPLOAD_FILE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  // End chat session
  endChatSession: async (chatId: string): Promise<ChatSession> => {
    const response = await api.post<ApiResponse<ChatSession>>(
      `${API_ENDPOINTS.END_CHAT}/${chatId}/end`
    );
    return response.data.data!;
  },
};

