import { Request, Response, NextFunction } from 'express';
import {
  getChatSession,
  getUserChats,
  sendMessage,
  uploadFile,
  endChatSession,
} from '../services/chats.service';
import { sendSuccess, sendError, sendPagination } from '../utils/responses';
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';
import { io } from '../server';

export const getChatSessionController = async (
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
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const chat = await getChatSession(id, req.userId, page, limit);

    sendSuccess(res, chat);
  } catch (error) {
    next(error);
  }
};

export const getMyChatsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await getUserChats(req.userId, page, limit);
    
    sendPagination(res, result.chats, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessageController = async (
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
    const { type, text, contentURL } = req.body;

    console.log('Send message request:', {
      chatId: id,
      userId: req.userId,
      type,
      hasText: !!text,
      hasContentURL: !!contentURL,
      hasFile: !!req.file,
      bodyKeys: Object.keys(req.body),
    });

    if (!type) {
      sendError(res, ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS.BAD_REQUEST);
      return;
    }

    // Handle file upload if message type is file
    let fileURL = contentURL;
    if (req.file && ['image', 'video', 'document'].includes(type)) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      fileURL = await uploadFile(req.file, baseUrl);
    }

    const message = await sendMessage({
      chatId: id,
      senderId: req.userId,
      type: type as 'text' | 'image' | 'video' | 'document' | 'link',
      text,
      contentURL: fileURL,
    });

    console.log('Message sent successfully:', {
      messageId: (message as any)._id,
      type: message.type,
    });

    // Emit socket event to notify all participants in the chat room
    if (io) {
      io.to(`chat:${id}`).emit('new-message', {
        message,
        chatId: id,
      });
      console.log('Socket event emitted for chat:', id);
    } else {
      console.warn('Socket.io not initialized, real-time updates may not work');
    }

    sendSuccess(res, message, SUCCESS_MESSAGES.MESSAGE_SENT);
  } catch (error) {
    console.error('Error in sendMessageController:', error);
    next(error);
  }
};

export const uploadFileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileURL = await uploadFile(req.file, baseUrl);

    sendSuccess(res, { url: fileURL });
  } catch (error) {
    next(error);
  }
};

export const endChatSessionController = async (
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
    const chat = await endChatSession(id, req.userId);

    sendSuccess(res, chat, SUCCESS_MESSAGES.CHAT_ENDED);
  } catch (error) {
    next(error);
  }
};

