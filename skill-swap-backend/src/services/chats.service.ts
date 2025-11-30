import ChatSession, { IChatSession, IMessage } from '../models/ChatSession';
import { ERROR_MESSAGES, VALIDATION_RULES } from '../utils/constants';
import mongoose from 'mongoose';

export interface SendMessageData {
  chatId: string;
  senderId: string;
  type: 'text' | 'image' | 'video' | 'document' | 'link';
  text?: string;
  contentURL?: string;
}

// Get chat session by ID or requestId with paginated messages
export const getChatSession = async (
  chatIdOrRequestId: string,
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<IChatSession & { messagesCount?: number; totalPages?: number }> => {
  if (!mongoose.Types.ObjectId.isValid(chatIdOrRequestId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const skip = (page - 1) * limit;

  // Try to find by chat ID first, then by requestId
  let chat = await ChatSession.findById(chatIdOrRequestId);
  
  if (!chat) {
    chat = await ChatSession.findOne({ requestId: chatIdOrRequestId });
  }

  if (!chat) {
    throw new Error(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  // Validate user is participant
  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === userId
  );

  if (!isParticipant) {
    throw new Error(ERROR_MESSAGES.NOT_CHAT_PARTICIPANT);
  }

  // Get total messages count
  const messagesCount = chat.messages.length;

  // Paginate messages (most recent first)
  const paginatedMessages = chat.messages
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(skip, skip + limit)
    .reverse(); // Reverse to show oldest first in the slice

  // Create a copy of chat with paginated messages
  const chatWithPaginatedMessages = chat.toObject() as unknown as Record<string, unknown>;
  chatWithPaginatedMessages.messages = paginatedMessages;
  chatWithPaginatedMessages.messagesCount = messagesCount;
  chatWithPaginatedMessages.totalPages = Math.ceil(messagesCount / limit);

  await ChatSession.populate(chatWithPaginatedMessages, [
    { path: 'participants', select: 'name email profilePictureURL' },
    {
      path: 'requestId',
      populate: [
        { path: 'offeredSkillId', select: 'name category' },
        { path: 'requestedSkillId', select: 'name category' },
      ],
    },
  ]);

  return chatWithPaginatedMessages as unknown as IChatSession & { messagesCount: number; totalPages: number };
};

// Get all chats for a user with pagination
export const getUserChats = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ chats: IChatSession[]; total: number; page: number; limit: number; totalPages: number }> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const actualLimit = Math.min(limit, VALIDATION_RULES.MAX_LIMIT);
  const skip = (page - 1) * actualLimit;

  const [chats, total] = await Promise.all([
    ChatSession.find({
      participants: userId,
      endedAt: null, // Only active chats
    })
      .populate([
        { path: 'participants', select: 'name email profilePictureURL' },
        {
          path: 'requestId',
          populate: [
            { path: 'offeredSkillId', select: 'name category' },
            { path: 'requestedSkillId', select: 'name category' },
          ],
        },
      ])
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(actualLimit)
      .lean()
      .exec(),
    ChatSession.countDocuments({
      participants: userId,
      endedAt: null,
    }),
  ]);

  return {
    chats: chats as IChatSession[],
    total,
    page,
    limit: actualLimit,
    totalPages: Math.ceil(total / actualLimit),
  };
};

// Send message in chat
export const sendMessage = async (data: SendMessageData): Promise<IMessage> => {
  const { chatId, senderId, type, text, contentURL } = data;

  if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Validate message type and content
  if (type === 'text' || type === 'link') {
    if (!text) {
      throw new Error('Text is required for text/link messages');
    }
  } else if (['image', 'video', 'document'].includes(type)) {
    if (!contentURL) {
      throw new Error('Content URL is required for file messages');
    }
  }

  // Get chat session
  const chat = await ChatSession.findById(chatId);
  if (!chat) {
    throw new Error(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  // Validate user is participant
  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === senderId
  );

  if (!isParticipant) {
    throw new Error(ERROR_MESSAGES.NOT_CHAT_PARTICIPANT);
  }

  // Check if chat has ended
  if (chat.endedAt) {
    throw new Error('Chat session has ended');
  }

  // Create message
  const message: IMessage = {
    senderId: senderId as unknown as mongoose.Types.ObjectId,
    type,
    timestamp: new Date(),
  };

  if (text) {
    message.text = text;
  }
  if (contentURL) {
    message.contentURL = contentURL;
  }

  // Add message to chat
  chat.messages.push(message);
  chat.updatedAt = new Date();
  await chat.save();

  return message;
};

// Upload file and return URL
export const uploadFile = async (
  file: Express.Multer.File,
  baseUrl: string
): Promise<string> => {
  // File should already be validated by multer middleware
  // Generate file URL
  const fileUrl = `${baseUrl}/uploads/${file.filename}`;
  return fileUrl;
};

// End chat session
export const endChatSession = async (chatId: string, userId: string): Promise<IChatSession> => {
  if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const chat = await ChatSession.findById(chatId);
  if (!chat) {
    throw new Error(ERROR_MESSAGES.CHAT_NOT_FOUND);
  }

  // Validate user is participant
  const isParticipant = chat.participants.some(
    (participantId) => participantId.toString() === userId
  );

  if (!isParticipant) {
    throw new Error(ERROR_MESSAGES.NOT_CHAT_PARTICIPANT);
  }

  // Set endedAt timestamp
  chat.endedAt = new Date();
  await chat.save();

  await chat.populate([
    { path: 'participants', select: 'name email profilePictureURL' },
    {
      path: 'requestId',
      populate: [
        { path: 'offeredSkillId', select: 'name category' },
        { path: 'requestedSkillId', select: 'name category' },
      ],
    },
  ]);

  return chat;
};

