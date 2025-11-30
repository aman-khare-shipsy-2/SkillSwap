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

    console.log('Create rating request:', {
      userId: req.userId,
      ratedUserId,
      skillId,
      score,
      hasComment: !!comment,
      sessionId,
      bodyKeys: Object.keys(req.body),
    });

    if (!ratedUserId || !skillId || !score) {
      console.error('Missing required fields:', { ratedUserId, skillId, score });
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    if (score < 1 || score > 5) {
      console.error('Invalid score:', score);
      sendError(res, 'Rating must be between 1 and 5', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    console.log('Calling createRating service...');
    const rating = await createRating({
      ratedUserId,
      ratedById: req.userId,
      skillId,
      score,
      comment,
      sessionId,
    });

    console.log('Rating created successfully:', rating._id);
    sendSuccess(res, rating, SUCCESS_MESSAGES.RATING_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error in createRatingController:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
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

