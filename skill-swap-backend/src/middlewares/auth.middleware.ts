import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';
import { sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, ERROR_MESSAGES.TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      sendError(res, ERROR_MESSAGES.TOKEN_MISSING, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    // Verify JWT token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        sendError(res, ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        sendError(res, ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
        return;
      }
      throw error;
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!user.isActive) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.FORBIDDEN);
      return;
    }

    // Attach user to request object
    (req as { user?: typeof user; userId?: string }).user = user;
    (req as { user?: typeof user; userId?: string }).userId = user._id.toString();

    next();
  } catch (error) {
    sendError(
      res,
      ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : String(error)
    );
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (user && user.isActive) {
        (req as { user?: typeof user; userId?: string }).user = user;
        (req as { user?: typeof user; userId?: string }).userId = user._id.toString();
      }
    } catch (error) {
      // Silently fail for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};

