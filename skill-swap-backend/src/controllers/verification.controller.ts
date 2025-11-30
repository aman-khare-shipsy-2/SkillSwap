import { Request, Response, NextFunction } from 'express';
import {
  startVerificationTest,
  submitTestAnswers,
  getTestById,
  getUserVerificationStatus,
} from '../services/verification.service';
import { sendSuccess, sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

export const startTestController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.body;

    if (!skillId) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Log for debugging
    console.log('Starting verification test:', { userId: req.userId, skillId });

    const test = await startVerificationTest(req.userId, skillId);

    sendSuccess(res, test, SUCCESS_MESSAGES.TEST_STARTED);
  } catch (error) {
    // Log error for debugging
    console.error('Error in startTestController:', error);
    next(error);
  }
};

export const submitTestController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { testId, answers } = req.body;

    if (!testId || !answers) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const test = await submitTestAnswers({
      testId,
      userId: req.userId,
      answers,
    });

    sendSuccess(res, test, SUCCESS_MESSAGES.TEST_SUBMITTED);
  } catch (error) {
    next(error);
  }
};

export const getTestStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const status = await getUserVerificationStatus(req.userId);

    sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
};

export const getTestByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const test = await getTestById(id, req.userId);

    sendSuccess(res, test);
  } catch (error) {
    next(error);
  }
};

