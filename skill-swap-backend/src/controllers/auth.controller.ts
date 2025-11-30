import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, offeredSkills } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const result = await registerUser({
      name,
      email,
      password,
      offeredSkills: offeredSkills || [],
    });

    sendSuccess(
      res,
      result,
      SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const result = await loginUser({ email, password });

    sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  } catch (error) {
    next(error);
  }
};

