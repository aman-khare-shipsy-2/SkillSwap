import app from './app';
import config from './config';
import { connectDB, disconnectDB } from './database/connection';
import { Server } from 'http';
import { initializeSocket } from './socket/socket';
import { startRequestExpiryJob } from './jobs/requestExpiry.job';
import { startAnalyticsUpdateJob } from './jobs/analyticsUpdate.job';

const PORT = config.port;
let server: Server | undefined;
let io: ReturnType<typeof initializeSocket> | undefined;

// Export io for use in other modules if needed
export { io };

// Initialize server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server - listen on 0.0.0.0 for Render deployment
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
    });

    // Initialize Socket.io
    if (server) {
      io = initializeSocket(server);
      console.log('🔌 Socket.io initialized');
    }

    // Start background jobs
    startRequestExpiryJob();
    startAnalyticsUpdateJob();
    console.log('📅 Background jobs started');

    // Setup graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const setupGracefulShutdown = (): void => {
  const shutdown = async (signal: string) => {
    console.log(`${signal} signal received: closing HTTP server`);
    
    if (server) {
      server.close(async () => {
        console.log('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      await disconnectDB();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Start the application
startServer();

export { server };
