import { Request, Response, NextFunction } from 'express';
import {
  createRating,
  getUserRatings,
  getRatingById,
} from '../services/ratings.service';
import { sendSuccess, sendError } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

export const createRatingController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { ratedUserId, skillId, score, comment, sessionId } = req.body;

    if (!ratedUserId || !skillId || !score) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    if (score < 1 || score > 5) {
      sendError(res, 'Rating must be between 1 and 5', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const rating = await createRating({
      ratedUserId,
      ratedById: req.userId,
      skillId,
      score,
      comment,
      sessionId,
    });

    sendSuccess(res, rating, SUCCESS_MESSAGES.RATING_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getMyRatingsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { skillId } = req.query;
    const result = await getUserRatings(req.userId, skillId as string | undefined);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getRatingByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rating = await getRatingById(id);

    sendSuccess(res, rating);
  } catch (error) {
    next(error);
  }
};

