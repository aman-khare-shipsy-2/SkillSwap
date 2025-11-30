import { Response } from 'express';

interface SuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
  };
  if (message) {
    response.message = message;
  }
  if (data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string,
  details?: unknown
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
  };
  if (error) {
    response.error = error;
  }
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

export const sendPagination = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const response: SuccessResponse<T[]> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
    },
  };
  if (message) {
    response.message = message;
  }
  return res.status(200).json(response);
};

