import { Request, Response, NextFunction } from 'express';

// Basic input sanitization
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  // Recursively sanitize object
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body (query and params are read-only in Express 5)
  if (req.body) {
    req.body = sanitize(req.body) as typeof req.body;
  }
  // Note: req.query and req.params are read-only in Express 5
  // Sanitization is handled by express-mongo-sanitize in app.ts if needed

  next();
};

