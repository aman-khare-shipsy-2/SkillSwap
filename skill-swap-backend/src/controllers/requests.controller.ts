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

    const { requestedSkillId, offeredSkillId } = req.query;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    console.log('Search users request:', {
      userId: req.userId,
      requestedSkillId,
      offeredSkillId,
      page,
      limit,
      queryKeys: Object.keys(req.query),
    });

    if (!requestedSkillId || !offeredSkillId) {
      console.error('Missing required fields:', { requestedSkillId, offeredSkillId });
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const result = await searchUsersForSkillExchange(
      requestedSkillId as string,
      offeredSkillId as string,
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

