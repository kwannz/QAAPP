/**
 * Authoritative Winston logger configuration for API.
 * All modules should import from this file; do not reintroduce parallel configs.
 */
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// 自定义格式化器
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      context: context || 'Application',
      message,
      ...(trace && { trace }),
      ...meta
    };
    
    return JSON.stringify(logObject, null, 0);
  })
);

// 开发环境格式
const developmentFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context }) => {
    const ctx = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${ctx} ${message}`;
  })
);

// 日志轮转配置
const createRotatingFileTransport = (filename: string, level?: string) => {
  return new winston.transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d', // 保留14天
    level: level,
    format: customFormat,
    auditFile: `logs/.${filename}-audit.json`
  });
};

export const createWinstonConfig = (isDevelopment = false): WinstonModuleOptions => {
  const transports: winston.transport[] = [];

  if (isDevelopment) {
    // 开发环境 - 控制台输出
    transports.push(
      new winston.transports.Console({
        format: developmentFormat
      })
    );
  } else {
    // 生产环境 - 文件输出
    transports.push(
      // 控制台输出 (简化)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      
      // 错误日志 (单独文件)
      createRotatingFileTransport('error', 'error'),
      
      // 警告日志
      createRotatingFileTransport('warn', 'warn'),
      
      // 所有日志
      createRotatingFileTransport('combined'),
      
      // API 访问日志
      createRotatingFileTransport('access', 'info'),
      
      // 性能日志
      createRotatingFileTransport('performance', 'info')
    );
  }

  return {
    level: isDevelopment ? 'debug' : 'info',
    format: customFormat,
    defaultMeta: {
      service: 'qa-app-api',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    transports,
    exitOnError: false,
    
    // 生产环境异常处理
    exceptionHandlers: isDevelopment ? [] : [
      createRotatingFileTransport('exceptions')
    ],
    
    // 未捕获的 Promise 拒绝
    rejectionHandlers: isDevelopment ? [] : [
      createRotatingFileTransport('rejections')
    ]
  };
};

// 日志级别定义
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
  VERBOSE = 'verbose'
}

// 日志上下文
export enum LogContext {
  AUTH = 'Auth',
  ORDER = 'Order',
  PAYMENT = 'Payment',
  CACHE = 'Cache',
  DATABASE = 'Database',
  PERFORMANCE = 'Performance',
  SECURITY = 'Security',
  API = 'API',
  WEBSOCKET = 'WebSocket',
  BLOCKCHAIN = 'Blockchain'
}

// 结构化日志接口
export interface StructuredLog {
  message: string;
  context?: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  responseTime?: number;
  statusCode?: number;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// 性能日志接口  
export interface PerformanceLog extends StructuredLog {
  operation: string;
  duration: number;
  memoryUsage?: {
    before: NodeJS.MemoryUsage;
    after: NodeJS.MemoryUsage;
  };
  cacheHit?: boolean;
  queryCount?: number;
}

// 安全日志接口
export interface SecurityLog extends StructuredLog {
  event: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, any>;
}
