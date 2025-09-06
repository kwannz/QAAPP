import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { Request } from 'express';

// 动态导入以避免模块加载错误
let DailyRotateFile: any;
try {
  DailyRotateFile = require('winston-daily-rotate-file');
} catch (error) {
  console.warn('winston-daily-rotate-file not found, using file transport instead');
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger!: winston.Logger;
  private requestLogger!: winston.Logger;
  private performanceLogger!: winston.Logger;
  private auditLogger!: winston.Logger;
  private errorLogger!: winston.Logger;

  constructor() {
    this.initializeLoggers();
  }

  private initializeLoggers() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.prettyPrint()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
      winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level} [${context || 'App'}]: ${message}${metaStr}`;
      })
    );

    // 主应用日志
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'qa-app-api' },
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        ...(DailyRotateFile ? [
          new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
          })
        ] : [
          new winston.transports.File({
            filename: 'logs/app.log',
            maxsize: 20 * 1024 * 1024, // 20MB
          })
        ]),
      ],
    });

    // 请求日志
    this.requestLogger = winston.createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'api-requests' },
      transports: [
        ...(DailyRotateFile ? [
          new DailyRotateFile({
            filename: 'logs/requests-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '30d',
          })
        ] : [
          new winston.transports.File({
            filename: 'logs/requests.log',
            maxsize: 50 * 1024 * 1024,
          })
        ]),
      ],
    });

    // 性能日志
    this.performanceLogger = winston.createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'performance' },
      transports: [
        ...(DailyRotateFile ? [
          new DailyRotateFile({
            filename: 'logs/performance-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '7d',
          })
        ] : [
          new winston.transports.File({
            filename: 'logs/performance.log',
            maxsize: 20 * 1024 * 1024,
          })
        ]),
      ],
    });

    // 审计日志
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'audit' },
      transports: [
        ...(DailyRotateFile ? [
          new DailyRotateFile({
            filename: 'logs/audit-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '90d', // 审计日志保留更长时间
          })
        ] : [
          new winston.transports.File({
            filename: 'logs/audit.log',
            maxsize: 50 * 1024 * 1024,
          })
        ]),
      ],
    });

    // 错误日志
    this.errorLogger = winston.createLogger({
      level: 'error',
      format: logFormat,
      defaultMeta: { service: 'errors' },
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        ...(DailyRotateFile ? [
          new DailyRotateFile({
            filename: 'logs/errors-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
          })
        ] : [
          new winston.transports.File({
            filename: 'logs/errors.log',
            maxsize: 20 * 1024 * 1024,
          })
        ]),
      ],
    });
  }

  // NestJS LoggerService 接口实现
  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.errorLogger.error(message, { trace, context });
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // 自定义日志方法

  // 记录API请求
  logRequest(request: Request, response: any, duration: number) {
    const log = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      path: request.path,
      query: request.query,
      body: this.sanitizeBody(request.body),
      headers: this.sanitizeHeaders(request.headers),
      ip: request.ip,
      userAgent: request.get('user-agent'),
      userId: (request as any).user?.id,
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      responseSize: response.get ? response.get('content-length') : undefined,
    };

    this.requestLogger.info('API Request', log);

    // 慢请求警告
    if (duration > 1000) {
      this.performanceLogger.warn('Slow API Request', {
        ...log,
        warning: 'Request took longer than 1 second',
      });
    }
  }

  // 记录性能指标
  logPerformance(operation: string, duration: number, metadata?: any) {
    const log = {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    this.performanceLogger.info('Performance Metric', log);

    // 性能警告
    if (duration > 3000) {
      this.performanceLogger.warn('Performance Warning', {
        ...log,
        warning: 'Operation took longer than 3 seconds',
      });
    }
  }

  // 记录审计事件
  logAudit(userId: string, action: string, resource: string, details?: any) {
    const log = {
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      details: this.sanitizeData(details),
    };

    this.auditLogger.info('Audit Event', log);
  }

  // 记录安全事件
  logSecurity(event: string, userId?: string, details?: any) {
    const log = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      severity: this.getSecuritySeverity(event),
      details: this.sanitizeData(details),
    };

    this.auditLogger.warn('Security Event', log);
  }

  // 记录业务事件
  logBusiness(event: string, metadata?: any) {
    this.logger.info(`Business Event: ${event}`, {
      context: 'Business',
      ...metadata,
    });
  }

  // 记录数据库查询
  logQuery(query: string, parameters?: any[], duration?: number) {
    const log = {
      query: this.sanitizeQuery(query),
      parameters: parameters?.map(p => this.sanitizeData(p)),
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString(),
    };

    if (duration && duration > 100) {
      this.performanceLogger.warn('Slow Database Query', log);
    } else {
      this.logger.debug('Database Query', { context: 'Database', ...log });
    }
  }

  // 记录缓存操作
  logCache(operation: string, key: string, hit: boolean, duration?: number) {
    this.logger.debug(`Cache ${operation}`, {
      context: 'Cache',
      key,
      hit,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  // 记录队列操作
  logQueue(queue: string, operation: string, message: any, status: 'success' | 'failure', error?: any) {
    const log = {
      queue,
      operation,
      message: this.sanitizeData(message),
      status,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    };

    if (status === 'failure') {
      this.errorLogger.error('Queue Operation Failed', log);
    } else {
      this.logger.info('Queue Operation', { context: 'Queue', ...log });
    }
  }

  // 记录外部服务调用
  logExternalCall(service: string, method: string, url: string, duration: number, status: number, error?: any) {
    const log = {
      service,
      method,
      url,
      duration: `${duration}ms`,
      status,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    };

    if (error || status >= 400) {
      this.errorLogger.error('External Service Call Failed', log);
    } else if (duration > 2000) {
      this.performanceLogger.warn('Slow External Service Call', log);
    } else {
      this.logger.info('External Service Call', { context: 'External', ...log });
    }
  }

  // 记录WebSocket事件
  logWebSocket(event: string, clientId: string, data?: any) {
    this.logger.info(`WebSocket ${event}`, {
      context: 'WebSocket',
      clientId,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
    });
  }

  // 获取日志统计
  async getLogStats(): Promise<any> {
    // 这里可以实现日志统计逻辑
    return {
      totalLogs: 0,
      errorCount: 0,
      warnCount: 0,
      slowRequests: 0,
      auditEvents: 0,
    };
  }

  // 数据脱敏
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '***REDACTED***';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;
    
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private sanitizeQuery(query: string): string {
    // 简单的SQL查询脱敏
    return query.replace(/password\s*=\s*'[^']*'/gi, "password='***REDACTED***'");
  }

  private getSecuritySeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalEvents = ['UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'INJECTION_ATTEMPT'];
    const highEvents = ['LOGIN_FAILURE_MULTIPLE', 'PERMISSION_VIOLATION', 'SUSPICIOUS_ACTIVITY'];
    const mediumEvents = ['LOGIN_FAILURE', 'INVALID_TOKEN', 'RATE_LIMIT_EXCEEDED'];
    
    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    if (mediumEvents.includes(event)) return 'medium';
    return 'low';
  }
}