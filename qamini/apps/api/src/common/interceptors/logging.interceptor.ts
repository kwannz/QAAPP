import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { StructuredLog, PerformanceLog, LogContext } from '../logger/winston.config';
import { getErrorMessage, getErrorStack } from '../utils/error.utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const requestId = this.generateRequestId();
    const userAgent = request.headers['user-agent'] || '';
    const ipAddress = this.extractIpAddress(request);
    const userId = (request as any).user?.id;

    // 添加请求ID到响应头
    response.setHeader('X-Request-ID', requestId);

    // 请求开始日志
    const startLog: StructuredLog = {
      message: `Incoming ${request.method} ${request.url}`,
      context: LogContext.API,
      requestId,
      endpoint: request.url,
      method: request.method,
      userId,
      userAgent,
      ipAddress,
      metadata: {
        query: request.query,
        params: request.params,
        bodySize: request.headers['content-length'] || 0
      }
    };

    this.logStructured('info', startLog);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        
        // 响应成功日志
        const successLog: PerformanceLog = {
          message: `${request.method} ${request.url} - ${response.statusCode}`,
          context: LogContext.API,
          requestId,
          endpoint: request.url,
          method: request.method,
          responseTime,
          statusCode: response.statusCode,
          userId,
          userAgent,
          ipAddress,
          operation: 'http_request',
          duration: responseTime,
          metadata: {
            responseSize: JSON.stringify(data || {}).length,
            success: true
          }
        };

        // 记录性能警告
        if (responseTime > 2000) {
          this.logStructured('warn', {
            ...successLog,
            message: `🐌 Slow response: ${request.method} ${request.url} took ${responseTime}ms`
          });
        } else {
          this.logStructured('info', successLog);
        }
      }),
      catchError((error: unknown) => {
        const responseTime = Date.now() - startTime;
        
        // 错误响应日志
        const errorLog: StructuredLog = {
          message: `❌ ${request.method} ${request.url} - ${(error as any).status || 500}`,
          context: LogContext.API,
          requestId,
          endpoint: request.url,
          method: request.method,
          responseTime,
          statusCode: (error as any).status || 500,
          userId,
          userAgent,
          ipAddress,
          metadata: {
            error: getErrorMessage(error),
            stack: getErrorStack(error),
            success: false
          }
        };

        this.logStructured('error', errorLog);
        throw error;
      })
    );
  }

  private logStructured(level: string, log: StructuredLog | PerformanceLog): void {
    const logMessage = {
      ...log,
      timestamp: new Date().toISOString(),
      service: 'qa-app-api'
    };

    switch (level) {
      case 'error':
        this.logger.error(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      case 'debug':
        this.logger.debug(logMessage);
        break;
      default:
        this.logger.log(logMessage);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private extractIpAddress(request: Request): string {
    // 从多个可能的头部提取真实IP
    return (
      (request.headers['cf-connecting-ip'] as string) || // Cloudflare
      (request.headers['x-real-ip'] as string) || // Nginx
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] || // 代理
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.connection as any).socket?.remoteAddress ||
      'unknown'
    ).replace(/^::ffff:/, ''); // 移除IPv6前缀
  }
}