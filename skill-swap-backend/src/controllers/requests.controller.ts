import { Request, Response, NextFunction } from 'express';
import {
  createRequest,
  getUserRequests,
  acceptRequest,
  rejectRequest,
  forfeitRequest,
  searchUsersForSkillExchange,
} from '../services/requests.service';
import { sendSuccess, sendError, sendPagination } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

export const createRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { receiverId, offeredSkillId, requestedSkillId } = req.body;

    if (!receiverId || !offeredSkillId || !requestedSkillId) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const request = await createRequest({
      senderId: req.userId,
      receiverId,
      offeredSkillId,
      requestedSkillId,
    });

    sendSuccess(res, request, SUCCESS_MESSAGES.REQUEST_CREATED, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
};

export const getMyRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { status } = req.query;
    const requests = await getUserRequests(req.userId, status as string | undefined);

    sendSuccess(res, requests);
  } catch (error) {
    next(error);
  }
};

export const acceptRequestController = async (
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
    const result = await acceptRequest(id, req.userId);

    sendSuccess(res, result, SUCCESS_MESSAGES.REQUEST_ACCEPTED);
  } catch (error) {
    next(error);
  }
};

export const rejectRequestController = async (
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
    const request = await rejectRequest(id, req.userId);

    sendSuccess(res, request, SUCCESS_MESSAGES.REQUEST_REJECTED);
  } catch (error) {
    next(error);
  }
};

export const forfeitRequestController = async (
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
    const request = await forfeitRequest(id, req.userId);

    sendSuccess(res, request, SUCCESS_MESSAGES.REQUEST_FORFEITED);
  } catch (error) {
    next(error);
  }
};

export const searchUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const { requestedSkillId, offeredSkillIds } = req.query;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    console.log('Search users request:', {
      userId: req.userId,
      requestedSkillId,
      offeredSkillIds,
      page,
      limit,
      queryKeys: Object.keys(req.query),
    });

    if (!requestedSkillId || !offeredSkillIds) {
      console.error('Missing required fields:', { requestedSkillId, offeredSkillIds });
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Handle offeredSkillIds as array (can be comma-separated string or array)
    let offeredSkillIdsArray: string[] = [];
    if (Array.isArray(offeredSkillIds)) {
      offeredSkillIdsArray = offeredSkillIds as string[];
    } else if (typeof offeredSkillIds === 'string') {
      // Split comma-separated string into array
      offeredSkillIdsArray = offeredSkillIds.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
    } else {
      console.error('Invalid offeredSkillIds format:', offeredSkillIds);
      sendError(res, ERROR_MESSAGES.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    if (offeredSkillIdsArray.length === 0) {
      console.error('No valid offered skill IDs provided');
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const result = await searchUsersForSkillExchange(
      requestedSkillId as string,
      offeredSkillIdsArray, // Pass array of offered skill IDs
      req.userId, // Pass userId to exclude current user
      page,
      limit
    );

    console.log('Search users result:', {
      total: result.total,
      usersFound: result.users.length,
    });

    sendPagination(res, result.users, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    console.error('Error in searchUsersController:', error);
    next(error);
  }
};

