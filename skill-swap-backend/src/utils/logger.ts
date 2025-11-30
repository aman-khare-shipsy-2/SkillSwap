import config from '../config';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
    return `${prefix} ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const fullContext = {
      ...context,
      error: errorMessage,
      stack: errorStack,
    };
    console.error(this.formatMessage('error', message, fullContext));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (config.nodeEnv === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Specialized logging methods

  /**
   * Log database operations
   */
  db(operation: string, collection: string, context?: LogContext): void {
    this.info(`DB ${operation}`, {
      collection,
      ...context,
    });
  }

  /**
   * Log database errors
   */
  dbError(operation: string, collection: string, error: Error, context?: LogContext): void {
    this.error(`DB ${operation} failed`, error, {
      collection,
      ...context,
    });
  }

  /**
   * Log file upload operations
   */
  upload(filename: string, size: number, mimetype: string, context?: LogContext): void {
    this.info('File upload', {
      filename,
      size,
      mimetype,
      ...context,
    });
  }

  /**
   * Log file upload errors
   */
  uploadError(filename: string, error: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.error('File upload failed', errorObj, {
      filename,
      ...context,
    });
  }

  /**
   * Log request operations
   */
  request(method: string, url: string, statusCode: number, duration?: number, context?: LogContext): void {
    this.info(`${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      ...context,
    });
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      userId,
      ...context,
    });
  }

  /**
   * Log authentication errors
   */
  authError(event: string, error: Error | string, context?: LogContext): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.warn(`Auth error: ${event}`, {
      error: errorObj.message,
      ...context,
    });
  }
}

const logger = new Logger();

export default logger;

