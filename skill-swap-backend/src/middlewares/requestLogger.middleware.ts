import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware to log all incoming requests with timing information
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request start
  logger.debug('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as { userId?: string }).userId,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log request completion
    logger.request(
      req.method,
      req.url,
      res.statusCode,
      duration,
      {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: (req as { userId?: string }).userId,
      }
    );
  });

  next();
};

