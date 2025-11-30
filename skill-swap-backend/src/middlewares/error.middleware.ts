import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Prepare error context for logging
  const errorContext = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as { userId?: string }).userId,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  };

  // Handle custom AppError instances
  if (err instanceof AppError) {
    // Log operational errors at warn level, programming errors at error level
    if (err.isOperational) {
      logger.warn('Operational error occurred:', {
        error: err.message,
        statusCode: err.statusCode,
        code: err.code,
        ...errorContext,
      });
    } else {
      logger.error('Programming error occurred:', err, errorContext);
    }

    // Handle ValidationError with details
    if (err.name === 'ValidationError' && 'details' in err) {
      sendError(
        res,
        err.message,
        err.statusCode,
        err.name,
        (err as { details?: unknown }).details
      );
      return;
    }

    // Send error response
    sendError(
      res,
      err.message,
      err.statusCode,
      err.name,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const mongooseError = err as mongoose.Error.ValidationError;
    const errors = Object.values(mongooseError.errors).map((e) => e.message);
    logger.warn('Mongoose validation error:', {
      errors,
      ...errorContext,
    });
    sendError(
      res,
      ERROR_MESSAGES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      'Validation failed',
      errors
    );
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const castError = err as mongoose.Error.CastError;
    logger.warn('Mongoose cast error:', {
      path: castError.path,
      value: castError.value,
      ...errorContext,
    });
    sendError(
      res,
      ERROR_MESSAGES.INVALID_INPUT,
      HTTP_STATUS.BAD_REQUEST,
      'Invalid ID format'
    );
    return;
  }

  // Handle Mongoose duplicate key errors
  const errorWithCode = err as Error & { code?: string | number };
  if (errorWithCode.code === '11000' || (typeof errorWithCode.code === 'number' && errorWithCode.code === 11000)) {
    const duplicateError = err as mongoose.Error & { keyPattern?: Record<string, unknown> };
    const field = Object.keys(duplicateError.keyPattern || {})[0];
    logger.warn('Duplicate key error:', {
      field,
      ...errorContext,
    });
    sendError(
      res,
      `${field} already exists`,
      HTTP_STATUS.CONFLICT,
      'Duplicate entry'
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.warn('JWT error:', {
      error: err.message,
      ...errorContext,
    });
    sendError(
      res,
      ERROR_MESSAGES.TOKEN_INVALID,
      HTTP_STATUS.UNAUTHORIZED
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn('Token expired:', errorContext);
    sendError(
      res,
      ERROR_MESSAGES.TOKEN_EXPIRED,
      HTTP_STATUS.UNAUTHORIZED
    );
    return;
  }

  // Handle Multer file upload errors
  if (err.name === 'MulterError') {
    logger.warn('File upload error:', {
      error: err.message,
      ...errorContext,
    });
    sendError(
      res,
      err.message || ERROR_MESSAGES.FILE_UPLOAD_FAILED,
      HTTP_STATUS.BAD_REQUEST,
      'File upload error'
    );
    return;
  }

  // Handle unknown errors
  logger.error('Unknown error occurred:', err, errorContext);

  const statusCode = (err as AppError).statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;

  // Don't expose internal error details in production
  const errorMessage =
    process.env.NODE_ENV === 'production' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? ERROR_MESSAGES.INTERNAL_ERROR
      : message;

  sendError(
    res,
    errorMessage,
    statusCode,
    err.name || 'Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

// 404 handler for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(
    res,
    ERROR_MESSAGES.NOT_FOUND,
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
};

