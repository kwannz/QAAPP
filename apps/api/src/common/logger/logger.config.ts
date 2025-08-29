import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

/**
 * Winston Logger Configuration
 * Provides structured logging with rotation, different levels, and environments
 */
export class LoggerConfig {
  static createWinstonLogger(configService: ConfigService) {
    const logLevel = configService.get('LOG_LEVEL', 'info');
    const logToFile = configService.get('LOG_TO_FILE', 'true') === 'true';
    const logPath = configService.get('LOG_FILE_PATH', './logs');
    const nodeEnv = configService.get('NODE_ENV', 'development');

    // Custom format for structured logging
    const customFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...(context && { context }),
          ...(trace && { trace }),
          ...meta,
        };

        return JSON.stringify(logEntry);
      })
    );

    // Development format (more readable)
    const developmentFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const traceStr = trace ? `\n${trace}` : '';
        
        return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}${metaStr}${traceStr}`;
      })
    );

    const transports: winston.transport[] = [];

    // Console transport
    transports.push(
      new winston.transports.Console({
        level: logLevel,
        format: nodeEnv === 'production' ? customFormat : developmentFormat,
      })
    );

    // File transports (only if enabled)
    if (logToFile) {
      // General log file
      transports.push(
        new DailyRotateFile({
          filename: `${logPath}/application-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: logLevel,
          format: customFormat,
        })
      );

      // Error log file
      transports.push(
        new DailyRotateFile({
          filename: `${logPath}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: customFormat,
        })
      );

      // Debug log file (development only)
      if (nodeEnv === 'development') {
        transports.push(
          new DailyRotateFile({
            filename: `${logPath}/debug-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
            level: 'debug',
            format: customFormat,
          })
        );
      }
    }

    return WinstonModule.createLogger({
      level: logLevel,
      format: customFormat,
      transports,
      // Handle uncaught exceptions and unhandled rejections
      exceptionHandlers: logToFile ? [
        new DailyRotateFile({
          filename: `${logPath}/exceptions-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        })
      ] : [],
      rejectionHandlers: logToFile ? [
        new DailyRotateFile({
          filename: `${logPath}/rejections-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
        })
      ] : [],
      exitOnError: false,
    });
  }

  /**
   * Create logger for specific service/module
   */
  static createServiceLogger(service: string, configService: ConfigService) {
    const logger = this.createWinstonLogger(configService);
    return {
      log: (message: string, context?: any) => logger.log('info', message, { context: service, ...context }),
      error: (message: string, trace?: string, context?: any) => logger.error(message, { context: service, trace, ...context }),
      warn: (message: string, context?: any) => logger.warn(message, { context: service, ...context }),
      debug: (message: string, context?: any) => logger.debug(message, { context: service, ...context }),
      verbose: (message: string, context?: any) => logger.verbose(message, { context: service, ...context }),
    };
  }
}

/**
 * Request logging middleware configuration
 */
export const requestLoggingConfig = {
  format: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  stream: {
    write: (message: string) => {
      // Use Winston to log HTTP requests
      const logger = winston.createLogger({
        transports: [
          new winston.transports.Console(),
        ],
      });
      logger.info(message.trim());
    },
  },
};

/**
 * Performance monitoring configuration
 */
export const performanceConfig = {
  slowQueryThreshold: 1000, // ms
  slowRequestThreshold: 5000, // ms
  memoryUsageThreshold: 0.8, // 80% of available memory
  cpuUsageThreshold: 0.8, // 80% CPU usage
};

/**
 * Log sanitization for sensitive data
 */
export const sanitizeLogData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'privateKey',
    'authorization',
    'cookie',
    'session',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
};