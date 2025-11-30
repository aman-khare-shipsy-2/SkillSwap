import mongoose from 'mongoose';
import config from '../config';
import { seedPredefinedSkills } from '../utils/seedSkills';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

let retryCount = 0;

const connectDB = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    await mongoose.connect(config.mongodbUri, options);

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);

    // Drop problematic index if it exists (parallel arrays issue)
    try {
      const userCollection = mongoose.connection.collection('users');
      const indexes = await userCollection.indexes();
      const problematicIndex = indexes.find(
        (idx) =>
          idx.key && 
          typeof idx.key === 'object' &&
          'offeredSkills' in idx.key && 
          'desiredSkills' in idx.key && 
          'isActive' in idx.key
      );
      if (problematicIndex && problematicIndex.name) {
        await userCollection.dropIndex(problematicIndex.name);
        console.log('⚠️  Dropped problematic parallel arrays index');
      }
    } catch (error) {
      // Ignore errors - index might not exist
    }

    // Reset retry count on successful connection
    retryCount = 0;

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Seed predefined skills after successful connection
    try {
      await seedPredefinedSkills();
    } catch (error) {
      console.error('⚠️  Error seeding predefined skills:', error);
      // Don't exit - continue even if seeding fails
    }
  } catch (error) {
    retryCount++;
    console.error(`❌ MongoDB connection failed (Attempt ${retryCount}/${MAX_RETRIES}):`, error);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => {
        connectDB();
      }, RETRY_DELAY);
    } else {
      console.error('❌ Max retries reached. Exiting...');
      process.exit(1);
    }
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

export { connectDB, disconnectDB };

