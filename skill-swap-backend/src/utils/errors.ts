import { HTTP_STATUS } from './constants';

/**
 * Base custom error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string, code?: string) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, code);
    this.name = 'BadRequestError';
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', code?: string) {
    super(message, HTTP_STATUS.UNAUTHORIZED, true, code);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', code?: string) {
    super(message, HTTP_STATUS.FORBIDDEN, true, code);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, HTTP_STATUS.NOT_FOUND, true, code);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, HTTP_STATUS.CONFLICT, true, code);
    this.name = 'ConflictError';
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown, code?: string) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, true, code);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, true, code);
    this.name = 'TooManyRequestsError';
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, code);
    this.name = 'InternalServerError';
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * File Upload Error
 */
export class FileUploadError extends AppError {
  constructor(message: string, code?: string) {
    super(message, HTTP_STATUS.BAD_REQUEST, true, code || 'FILE_UPLOAD_ERROR');
    this.name = 'FileUploadError';
  }
}

