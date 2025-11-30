import Rating, { IRating } from '../models/Rating';
import User from '../models/User';
import Analytics from '../models/Analytics';
import { ERROR_MESSAGES, RATINGS_HISTORY_LIMIT } from '../utils/constants';
import mongoose from 'mongoose';

export interface CreateRatingData {
  ratedUserId: string;
  ratedById: string;
  skillId: string;
  score: number;
  comment?: string;
  sessionId?: string;
}

export interface UserRatings {
  ratings: IRating[];
  averageRating: number;
  totalRatings: number;
}

// Create rating
export const createRating = async (data: CreateRatingData): Promise<IRating> => {
  const { ratedUserId, ratedById, skillId, score, comment, sessionId } = data;

  console.log('createRating service called with:', {
    ratedUserId,
    ratedById,
    skillId,
    score,
    sessionId,
  });

  // Validate ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(ratedUserId) ||
    !mongoose.Types.ObjectId.isValid(ratedById) ||
    !mongoose.Types.ObjectId.isValid(skillId)
  ) {
    console.error('Invalid ObjectIds:', {
      ratedUserId: mongoose.Types.ObjectId.isValid(ratedUserId),
      ratedById: mongoose.Types.ObjectId.isValid(ratedById),
      skillId: mongoose.Types.ObjectId.isValid(skillId),
    });
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Validate sessionId if provided
  if (sessionId && !mongoose.Types.ObjectId.isValid(sessionId)) {
    console.error('Invalid sessionId:', sessionId);
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  // Check for duplicate rating for same session
  if (sessionId) {
    const existingRating = await Rating.findOne({
      ratedUserId,
      ratedById,
      sessionId,
    });

    if (existingRating) {
      throw new Error(ERROR_MESSAGES.ALREADY_RATED);
    }
  }

  // Create rating
  const rating = new Rating({
    ratedUserId,
    ratedById,
    skillId,
    score,
    comment: comment || '',
    sessionId: sessionId || undefined,
  });

  try {
    await rating.save();
    console.log('Rating saved to database:', rating._id);
  } catch (saveError) {
    console.error('Error saving rating:', saveError);
    throw saveError;
  }

  // Update user's average rating
  try {
    await updateUserAverageRating(ratedUserId);
    console.log('User average rating updated');
  } catch (updateError) {
    console.error('Error updating user average rating:', updateError);
    // Don't throw - rating is already saved
  }

  // Update user's ratings history
  try {
    await updateRatingsHistory(ratedUserId, {
      rating: score,
      skill: skillId as unknown as mongoose.Types.ObjectId,
      sessionId: sessionId ? (sessionId as unknown as mongoose.Types.ObjectId) : undefined,
      timestamp: new Date(),
    });
    console.log('Ratings history updated');
  } catch (historyError) {
    console.error('Error updating ratings history:', historyError);
    // Don't throw - rating is already saved
  }

  // Update analytics
  try {
    await updateAnalytics(ratedUserId, skillId, score, sessionId);
    console.log('Analytics updated');
  } catch (analyticsError) {
    console.error('Error updating analytics:', analyticsError);
    // Don't throw - rating is already saved
  }

  await rating.populate([
    { path: 'ratedUserId', select: 'name email profilePictureURL' },
    { path: 'ratedById', select: 'name email profilePictureURL' },
    { path: 'skillId', select: 'name category' },
    { path: 'sessionId', select: 'requestId' },
  ]);

  return rating;
};

// Get user ratings
export const getUserRatings = async (
  userId: string,
  skillId?: string
): Promise<UserRatings> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const query: Record<string, unknown> = { ratedUserId: userId };
  if (skillId && mongoose.Types.ObjectId.isValid(skillId)) {
    query.skillId = skillId;
  }

  const ratings = await Rating.find(query)
    .populate([
      { path: 'ratedById', select: 'name email profilePictureURL' },
      { path: 'skillId', select: 'name category' },
    ])
    .sort({ createdAt: -1 })
    .exec();

  // Calculate average rating
  const totalRatings = ratings.length;
  const sumRatings = ratings.reduce((sum, rating) => sum + rating.score, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  return {
    ratings,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalRatings,
  };
};

// Get rating by ID
export const getRatingById = async (ratingId: string): Promise<IRating> => {
  if (!mongoose.Types.ObjectId.isValid(ratingId)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  const rating = await Rating.findById(ratingId).populate([
    { path: 'ratedUserId', select: 'name email profilePictureURL' },
    { path: 'ratedById', select: 'name email profilePictureURL' },
    { path: 'skillId', select: 'name category' },
    { path: 'sessionId', select: 'requestId' },
  ]);

  if (!rating) {
    throw new Error(ERROR_MESSAGES.RATING_NOT_FOUND);
  }

  return rating;
};

// Update user's average rating
export const updateUserAverageRating = async (userId: string): Promise<void> => {
  const ratings = await Rating.find({ ratedUserId: userId });
  const totalRatings = ratings.length;
  const sumRatings = ratings.reduce((sum, rating) => sum + rating.score, 0);
  const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

  await User.findByIdAndUpdate(userId, {
    averageRating: Math.round(averageRating * 10) / 10,
  });
};

// Update user's ratings history
export const updateRatingsHistory = async (
  userId: string,
  ratingData: {
    rating: number;
    skill: mongoose.Types.ObjectId;
    sessionId?: mongoose.Types.ObjectId;
    timestamp: Date;
  }
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Add new rating to history
  user.ratingsHistory.push(ratingData);

  // Keep only last N ratings
  if (user.ratingsHistory.length > RATINGS_HISTORY_LIMIT) {
    user.ratingsHistory = user.ratingsHistory.slice(-RATINGS_HISTORY_LIMIT);
  }

  await user.save();
};

// Update analytics
const updateAnalytics = async (
  userId: string,
  skillId: string,
  score: number,
  sessionId?: string
): Promise<void> => {
  let analytics = await Analytics.findOne({ userId });

  if (!analytics) {
    analytics = new Analytics({
      userId: userId as unknown as mongoose.Types.ObjectId,
      ratingsTrend: [],
      sessionsPerMonth: [],
      totalRatingAverage: 0,
    });
  }

  // Update ratings trend
  analytics.ratingsTrend.push({
    rating: score,
    skill: skillId as unknown as mongoose.Types.ObjectId,
    sessionId: sessionId ? (sessionId as unknown as mongoose.Types.ObjectId) : undefined,
    timestamp: new Date(),
  });
  
  // Keep only last 20 ratings
  if (analytics.ratingsTrend.length > RATINGS_HISTORY_LIMIT) {
    analytics.ratingsTrend = analytics.ratingsTrend.slice(-RATINGS_HISTORY_LIMIT);
  }

  // Update total rating average
  const userRatings = await Rating.find({ ratedUserId: userId });
  const totalRatings = userRatings.length;
  const sumRatings = userRatings.reduce((sum, rating) => sum + rating.score, 0);
  analytics.totalRatingAverage = totalRatings > 0 ? sumRatings / totalRatings : 0;

  await analytics.save();
};

