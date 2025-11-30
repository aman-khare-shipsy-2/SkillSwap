import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import config from './config';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());

// Compression middleware (gzip responses)
app.use(compression());

// Rate limiting
app.use('/api', apiLimiter);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin.split(','),
    credentials: true,
  })
);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
import { sanitizeInput } from './middlewares/sanitize.middleware';
app.use(sanitizeInput);

// Logging middleware
import { requestLogger } from './middlewares/requestLogger.middleware';
app.use(requestLogger);

// Morgan for HTTP request logging (complements our custom logger)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
import apiRoutes from './routes';
app.use('/api', apiRoutes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;

