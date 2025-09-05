import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

export interface LoggingConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transport[];
  defaultMeta: Record<string, any>;
}

export const createLoggingConfig = (configService: ConfigService): LoggingConfig => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  
  // 基础格式
  const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

  // 开发环境控制台格式
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      const contextStr = context ? `[${context}]` : '[Application]';
      return `[${timestamp}] ${level} ${contextStr}: ${message}${metaStr}`;
    })
  );

  // 生产环境JSON格式
  const productionFormat = winston.format.combine(
    baseFormat,
    winston.format.prettyPrint({ depth: 3 })
  );

  const transports: winston.transport[] = [];

  // 控制台输出 (开发环境或非生产环境)
  if (isDevelopment || !isProduction) {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: configService.get('LOG_LEVEL', 'info')
      })
    );
  }

  // 生产环境文件输出
  if (isProduction) {
    const logDir = configService.get('LOG_DIR', './logs');
    
    // 应用日志
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'application.log'),
        format: productionFormat,
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        tailable: true,
        level: 'info'
      })
    );

    // 错误日志
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        format: productionFormat,
        maxsize: 20 * 1024 * 1024, // 20MB
        maxFiles: 5,
        level: 'error'
      })
    );

    // 审计日志 (独立文件)
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'audit.log'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.prettyPrint()
        ),
        maxsize: 100 * 1024 * 1024, // 100MB
        maxFiles: 30, // 保留更长时间
        level: 'info'
      })
    );
  }

  // 如果配置了外部日志服务 (如 ELK Stack)
  if (configService.get('ELASTICSEARCH_URL')) {
    // 这里可以添加 Elasticsearch 传输
    // 例如: winston-elasticsearch
  }

  return {
    level: configService.get('LOG_LEVEL', 'info'),
    format: isProduction ? productionFormat : consoleFormat,
    transports,
    defaultMeta: {
      service: 'qa-app-api',
      environment: configService.get('NODE_ENV', 'development'),
      version: configService.get('APP_VERSION', '1.0.0'),
      instance: configService.get('INSTANCE_ID', 'default'),
    }
  };
};

// 日志级别配置
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// 敏感数据过滤器
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'key',
  'apiKey',
  'accessToken',
  'refreshToken',
  'jwt',
  'privateKey',
  'mnemonic'
];

// 日志上下文增强器
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
  module?: string;
  component?: string;
  duration?: number;
  status?: 'success' | 'failure' | 'pending';
  timestamp?: string;
  metadata?: Record<string, any>;
}

export const enhanceLogContext = (baseContext: LogContext, additionalContext?: Record<string, any>): LogContext => {
  return {
    ...baseContext,
    ...additionalContext,
    timestamp: new Date().toISOString(),
  };
};