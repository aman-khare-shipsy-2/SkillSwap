import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';
import ChatSession from '../models/ChatSession';
import { sendMessage } from '../services/chats.service';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: typeof User;
}

// Socket authentication middleware
export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user as unknown as typeof User;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error('Authentication error: Token expired'));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error('Authentication error: Invalid token'));
      }
      throw error;
    }
  } catch (error) {
    next(error as Error);
  }
};

// Initialize Socket.io
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin.split(','),
      credentials: true,
    },
    path: '/socket.io',
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.userId}`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join chat room
    socket.on('join-chat', async (chatId: string) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Validate user is participant in chat
        const chat = await ChatSession.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          (id) => id.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant in this chat' });
          return;
        }

        socket.join(`chat:${chatId}`);
        logger.info(`User ${socket.userId} joined chat ${chatId}`);

        // Notify other participants
        socket.to(`chat:${chatId}`).emit('user-joined', {
          userId: socket.userId,
          chatId,
        });
      } catch (error) {
        logger.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${socket.userId} left chat ${chatId}`);

      // Notify other participants
      socket.to(`chat:${chatId}`).emit('user-left', {
        userId: socket.userId,
        chatId,
      });
    });

    // Send message via socket
    socket.on('send-message', async (data: {
      chatId: string;
      type: 'text' | 'image' | 'video' | 'document' | 'link';
      text?: string;
      contentURL?: string;
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const { chatId, type, text, contentURL } = data;

        // Save message to database
        const message = await sendMessage({
          chatId,
          senderId: socket.userId,
          type,
          text,
          contentURL,
        });

        // Emit message to all participants in the chat room
        io.to(`chat:${chatId}`).emit('new-message', {
          message,
          chatId,
        });

        // Acknowledge message receipt
        socket.emit('message-sent', {
          messageId: (message as unknown as { _id?: string })._id || 'unknown',
          chatId,
        });
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', {
          message: error instanceof Error ? error.message : 'Failed to send message',
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { chatId: string }) => {
      if (!socket.userId) return;

      socket.to(`chat:${data.chatId}`).emit('user-typing', {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    // Stop typing indicator
    socket.on('stop-typing', (data: { chatId: string }) => {
      if (!socket.userId) return;

      socket.to(`chat:${data.chatId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    // Message received acknowledgment
    socket.on('message-received', (data: { messageId: string; chatId: string }) => {
      // Could update read receipts here if needed
      logger.debug(`Message ${data.messageId} received by ${socket.userId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });

    // Error handler
    socket.on('error', (error: Error) => {
      logger.error('Socket error:', error);
    });
  });

  return io;
};

export default initializeSocket;

