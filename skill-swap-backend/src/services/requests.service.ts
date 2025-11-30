import SkillRequest, { ISkillRequest } from '../models/SkillRequest';
import User, { IUser } from '../models/User';
import ChatSession from '../models/ChatSession';
import { ERROR_MESSAGES, REQUEST_EXPIRATION_DAYS, VALIDATION_RULES } from '../utils/constants';
import mongoose from 'mongoose';

export interface CreateRequestData {
  senderId: string;
  receiverId: string;
  offeredSkillId: string;
  requestedSkillId: string;
}

export interface UserRequests {
  sent: ISkillRequest[];
  received: ISkillRequest[];
}

// Create skill exchange request
export const createRequest = async (data: CreateRequestData): Promise<ISkillRequest> => {
  // Validate ObjectIds
  const { senderId, receiverId, offeredSkillId, requestedSkillId } = data;
  
  if (
    !mongoose.Types.ObjectId.isValid(senderId) ||
    !mongoose.Types.ObjectId.isValid(receiverId) ||
    !mongoose.Types.ObjectId.isValid(offeredSkillId) ||
    !mongoose.Types.ObjectId.isValid(requestedSkillId)
  ) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Get sender and receiver
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Validate sender has the offered skill
  if (!sender.offeredSkills.some((id) => id.toString() === offeredSkillId)) {
    throw new Error('Sender does not offer the specified skill');
  }

  // Validate receiver has the requested skill in their offered skills
  if (!receiver.offeredSkills.some((id) => id.toString() === requestedSkillId)) {
    throw new Error('Receiver does not offer the skill you want to learn');
  }

  // Validate receiver wants to learn the skill sender offers
  if (!receiver.desiredSkills.some((id) => id.toString() === offeredSkillId)) {
    throw new Error('Receiver does not want to learn the skill you offer');
  }

  // Check for existing pending request between these users for same skills
  const existingRequest = await SkillRequest.findOne({
    senderId,
    receiverId,
    offeredSkillId,
    requestedSkillId,
    status: 'pending',
  });

  if (existingRequest) {
    throw new Error(ERROR_MESSAGES.REQUEST_ALREADY_EXISTS);
  }

  // Create expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REQUEST_EXPIRATION_DAYS);

  // Create request
  const request = new SkillRequest({
    senderId,
    receiverId,
    offeredSkillId,
    requestedSkillId,
    expiresAt,
  });

  await request.save();
  await request.populate([
    { path: 'senderId', select: 'name email profilePictureURL averageRating' },
    { path: 'receiverId', select: 'name email profilePictureURL averageRating' },
    { path: 'offeredSkillId', select: 'name category' },
    { path: 'requestedSkillId', select: 'name category' },
  ]);

  return request;
};

// Get user's requests (sent and received)
export const getUserRequests = async (
  userId: string,
  status?: string
): Promise<UserRequests> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const query: Record<string, unknown> = {};
  if (status) {
    query.status = status as ISkillRequest['status'];
  }

  const [sent, received] = await Promise.all([
    SkillRequest.find({ ...query, senderId: userId })
      .populate([
        { path: 'receiverId', select: 'name email profilePictureURL averageRating' },
        { path: 'offeredSkillId', select: 'name category' },
        { path: 'requestedSkillId', select: 'name category' },
      ])
      .sort({ createdAt: -1 })
      .exec(),
    SkillRequest.find({ ...query, receiverId: userId })
      .populate([
        { path: 'senderId', select: 'name email profilePictureURL averageRating' },
        { path: 'offeredSkillId', select: 'name category' },
        { path: 'requestedSkillId', select: 'name category' },
      ])
      .sort({ createdAt: -1 })
      .exec(),
  ]);

  return { sent, received };
};

// Accept request
export const acceptRequest = async (
  requestId: string,
  userId: string
): Promise<{ request: ISkillRequest; chatSession: typeof ChatSession }> => {
  if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const request = await SkillRequest.findById(requestId);
  if (!request) {
    throw new Error(ERROR_MESSAGES.REQUEST_NOT_FOUND);
  }

  // Validate user is the receiver
  if (request.receiverId.toString() !== userId) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  // Validate request is pending
  if (request.status !== 'pending') {
    throw new Error('Request is not pending');
  }

  // Check if request has expired
  if (request.expiresAt && request.expiresAt < new Date()) {
    request.status = 'expired';
    await request.save();
    throw new Error(ERROR_MESSAGES.REQUEST_EXPIRED);
  }

  // Update request status
  request.status = 'accepted';
  request.acceptedAt = new Date();
  await request.save();

  // Create chat session
  const chatSession = new ChatSession({
    requestId: request._id,
    participants: [request.senderId, request.receiverId],
    messages: [],
  });

  await chatSession.save();
  await chatSession.populate([
    { path: 'participants', select: 'name email profilePictureURL' },
    { path: 'requestId', populate: [{ path: 'offeredSkillId' }, { path: 'requestedSkillId' }] },
  ]);

  // Populate request for response
  await request.populate([
    { path: 'senderId', select: 'name email profilePictureURL averageRating' },
    { path: 'receiverId', select: 'name email profilePictureURL averageRating' },
    { path: 'offeredSkillId', select: 'name category' },
    { path: 'requestedSkillId', select: 'name category' },
  ]);

  return { request, chatSession: chatSession as unknown as typeof ChatSession };
};

// Reject request
export const rejectRequest = async (requestId: string, userId: string): Promise<ISkillRequest> => {
  if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const request = await SkillRequest.findById(requestId);
  if (!request) {
    throw new Error(ERROR_MESSAGES.REQUEST_NOT_FOUND);
  }

  // Validate user is the receiver
  if (request.receiverId.toString() !== userId) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  // Validate request is pending
  if (request.status !== 'pending') {
    throw new Error('Request is not pending');
  }

  // Update request status
  request.status = 'rejected';
  request.rejectedAt = new Date();
  await request.save();

  await request.populate([
    { path: 'senderId', select: 'name email profilePictureURL averageRating' },
    { path: 'receiverId', select: 'name email profilePictureURL averageRating' },
    { path: 'offeredSkillId', select: 'name category' },
    { path: 'requestedSkillId', select: 'name category' },
  ]);

  return request;
};

// Forfeit request
export const forfeitRequest = async (requestId: string, userId: string): Promise<ISkillRequest> => {
  if (!mongoose.Types.ObjectId.isValid(requestId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const request = await SkillRequest.findById(requestId);
  if (!request) {
    throw new Error(ERROR_MESSAGES.REQUEST_NOT_FOUND);
  }

  // Validate user is sender or receiver
  if (
    request.senderId.toString() !== userId &&
    request.receiverId.toString() !== userId
  ) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  // Validate request is pending or accepted
  if (!['pending', 'accepted'].includes(request.status)) {
    throw new Error('Cannot forfeit this request');
  }

  // Update request
  request.status = 'rejected'; // Or could be a new 'forfeited' status
  request.forfeitedBy = userId as unknown as mongoose.Types.ObjectId;
  await request.save();

  await request.populate([
    { path: 'senderId', select: 'name email profilePictureURL averageRating' },
    { path: 'receiverId', select: 'name email profilePictureURL averageRating' },
    { path: 'offeredSkillId', select: 'name category' },
    { path: 'requestedSkillId', select: 'name category' },
  ]);

  return request;
};

// Expire old requests
export const expireRequests = async (): Promise<number> => {
  const now = new Date();
  const result = await SkillRequest.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: now },
    },
    {
      status: 'expired',
    }
  );

  return result.modifiedCount;
};

// Search users for skill exchange with pagination
export const searchUsersForSkillExchange = async (
  requestedSkillId: string,
  userOfferedSkillId: string,
  userId: string, // Add userId to exclude current user
  page: number = 1,
  limit: number = 10
): Promise<{ users: IUser[]; total: number; page: number; limit: number; totalPages: number }> => {
  if (
    !mongoose.Types.ObjectId.isValid(requestedSkillId) ||
    !mongoose.Types.ObjectId.isValid(userOfferedSkillId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const actualLimit = Math.min(limit, VALIDATION_RULES.MAX_LIMIT);
  const skip = (page - 1) * actualLimit;

  console.log('Search users for skill exchange:', {
    requestedSkillId,
    userOfferedSkillId,
    userId,
    page,
    limit: actualLimit,
  });

  // Find users who:
  // 1. Offer the skill the user wants to learn (requestedSkillId)
  // 2. Want to learn the skill the user offers (userOfferedSkillId)
  // 3. Are active
  // 4. Are not the current user
  const searchQuery = {
    offeredSkills: new mongoose.Types.ObjectId(requestedSkillId),
    desiredSkills: new mongoose.Types.ObjectId(userOfferedSkillId),
    isActive: true,
    _id: { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude current user
  };

  console.log('Search query:', JSON.stringify(searchQuery, null, 2));

  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .select('name email profilePictureURL bio location averageRating verifiedSkills')
      .sort({ averageRating: -1 })
      .skip(skip)
      .limit(actualLimit)
      .lean()
      .exec(),
    User.countDocuments(searchQuery),
  ]);

  console.log('Search results:', {
    total,
    found: users.length,
    requestedSkillId,
    userOfferedSkillId,
  });

  return {
    users: users as IUser[],
    total,
    page,
    limit: actualLimit,
    totalPages: Math.ceil(total / actualLimit),
  };
};

