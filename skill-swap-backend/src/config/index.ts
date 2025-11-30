import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  uploadPath: string;
  maxFileSize: number;
  corsOrigin: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-swap',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10), // 20MB default
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required environment variables
if (config.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default-secret-change-in-production') {
    console.error('❌ ERROR: JWT_SECRET must be set in production!');
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ ERROR: JWT_SECRET must be at least 32 characters long!');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
    console.error('❌ ERROR: MONGODB_URI must be set to a production database in production!');
    process.exit(1);
  }
} else {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default-secret-change-in-production') {
    console.warn('⚠️  Warning: Using default JWT_SECRET. Change this in production!');
  }
}

export default config;

