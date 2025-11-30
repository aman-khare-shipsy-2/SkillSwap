import { Request, Response, NextFunction } from 'express';

// Rate limiting disabled for personal project
// All limiters are now no-op middlewares that just pass through

// General API rate limiter (disabled)
export const apiLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

// Strict rate limiter for authentication endpoints (disabled)
export const authLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

// File upload rate limiter (disabled)
export const uploadLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

