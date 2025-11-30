import cron from 'node-cron';
import { expireRequests } from '../services/requests.service';
import logger from '../utils/logger';

// Request expiry job - runs daily at midnight
export const startRequestExpiryJob = (): void => {
  // Schedule job to run daily at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('🔄 Starting request expiry job...');
      
      const expiredCount = await expireRequests();
      
      logger.info(`✅ Request expiry job completed. Expired ${expiredCount} request(s).`);
    } catch (error) {
      logger.error('❌ Error in request expiry job:', error);
    }
  });

  logger.info('📅 Request expiry job scheduled to run daily at midnight (UTC)');
};

// Manual trigger for testing (optional)
export const runRequestExpiryJob = async (): Promise<number> => {
  try {
    logger.info('🔄 Manually running request expiry job...');
    const expiredCount = await expireRequests();
    logger.info(`✅ Request expiry job completed. Expired ${expiredCount} request(s).`);
    return expiredCount;
  } catch (error) {
    logger.error('❌ Error in request expiry job:', error);
    throw error;
  }
};

