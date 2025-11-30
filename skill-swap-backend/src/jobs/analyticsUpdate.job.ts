import cron from 'node-cron';
import User from '../models/User';
import Analytics from '../models/Analytics';
import Rating from '../models/Rating';
import ChatSession from '../models/ChatSession';
import logger from '../utils/logger';
import { RATINGS_HISTORY_LIMIT } from '../utils/constants';
import mongoose from 'mongoose';

// Update analytics for a single user
const updateUserAnalytics = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  try {
    // Get all ratings for the user
    const ratings = await Rating.find({ ratedUserId: userId })
      .sort({ createdAt: -1 })
      .limit(RATINGS_HISTORY_LIMIT)
      .exec();

    // Calculate total average rating
    const totalRatings = await Rating.countDocuments({ ratedUserId: userId });
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Build ratings trend (last 20 ratings)
    const ratingsTrend = ratings.slice(0, RATINGS_HISTORY_LIMIT).map((rating) => ({
      rating: rating.score,
      skill: rating.skillId,
      sessionId: rating.sessionId,
      timestamp: rating.createdAt,
    }));

    // Get all chat sessions for the user
    const chatSessions = await ChatSession.find({
      participants: userId,
    })
      .select('createdAt')
      .exec();

    // Calculate sessions per month
    const sessionsPerMonthMap = new Map<string, number>();
    chatSessions.forEach((session) => {
      const month = session.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      sessionsPerMonthMap.set(month, (sessionsPerMonthMap.get(month) || 0) + 1);
    });

    const sessionsPerMonth = Array.from(sessionsPerMonthMap.entries()).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // Update or create analytics document
    await Analytics.findOneAndUpdate(
      { userId },
      {
        userId,
        ratingsTrend,
        sessionsPerMonth,
        totalRatingAverage: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );
  } catch (error) {
    logger.error(`Error updating analytics for user ${userId}:`, error);
    throw error;
  }
};

// Analytics update job - runs daily at 2 AM
export const startAnalyticsUpdateJob = (): void => {
  // Schedule job to run daily at 02:00 (2 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('🔄 Starting analytics update job...');

      // Get all active users
      const users = await User.find({ isActive: true })
        .select('_id')
        .exec();

      logger.info(`📊 Updating analytics for ${users.length} users...`);

      let successCount = 0;
      let errorCount = 0;

      // Update analytics for each user
      for (const user of users) {
        try {
          await updateUserAnalytics(user._id);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Failed to update analytics for user ${user._id}:`, error);
        }
      }

      logger.info(
        `✅ Analytics update job completed. Success: ${successCount}, Errors: ${errorCount}`
      );
    } catch (error) {
      logger.error('❌ Error in analytics update job:', error);
    }
  });

  logger.info('📅 Analytics update job scheduled to run daily at 2 AM');
};

// Manual trigger for testing (optional)
export const runAnalyticsUpdateJob = async (): Promise<{
  successCount: number;
  errorCount: number;
}> => {
  try {
    logger.info('🔄 Manually running analytics update job...');

    const users = await User.find({ isActive: true })
      .select('_id')
      .exec();

    logger.info(`📊 Updating analytics for ${users.length} users...`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await updateUserAnalytics(user._id);
        successCount++;
      } catch (error) {
        errorCount++;
        logger.error(`Failed to update analytics for user ${user._id}:`, error);
      }
    }

    logger.info(
      `✅ Analytics update job completed. Success: ${successCount}, Errors: ${errorCount}`
    );

    return { successCount, errorCount };
  } catch (error) {
    logger.error('❌ Error in analytics update job:', error);
    throw error;
  }
};

