import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    requestId?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // 生成请求ID（如果没有的话）
    const requestId = (
      (Array.isArray(request.headers['x-request-id']) 
        ? request.headers['x-request-id'][0] 
        : request.headers['x-request-id']) ||
      (Array.isArray(request.headers['x-correlation-id']) 
        ? request.headers['x-correlation-id'][0] 
        : request.headers['x-correlation-id']) ||
      this.generateRequestId()
    ) as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details: any = null;

    // 处理不同类型的异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCode(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        code = responseObj.code || this.getErrorCode(status);
        details = responseObj.details;
      }
    } else if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      code = 'RATE_LIMIT_EXCEEDED';
      message = 'Too many requests, please try again later';
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'APPLICATION_ERROR';
      
      // 数据库相关错误
      if (exception.message.includes('ECONNREFUSED')) {
        code = 'DATABASE_CONNECTION_ERROR';
        message = 'Database connection failed';
      } else if (exception.message.includes('duplicate key')) {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE_RESOURCE';
        message = 'Resource already exists';
      } else if (exception.message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        code = 'RESOURCE_NOT_FOUND';
        message = 'Requested resource not found';
      }
    }

    // 构造错误响应
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId,
      },
    };

    // 记录错误日志
    this.logError(exception, request, status, requestId);

    // 发送响应
    response
      .status(status)
      .header('X-Request-ID', requestId)
      .json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const statusCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
      [HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
    };

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }

  private logError(
    exception: unknown, 
    request: Request, 
    status: number, 
    requestId: string
  ): void {
    const message = exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : '';

    const logContext = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      status,
      message,
    };

    if (status >= 500) {
      this.logger.error(
        `Server Error: ${message}`,
        stack,
        JSON.stringify(logContext, null, 2)
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client Error: ${message}`,
        JSON.stringify(logContext, null, 2)
      );
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}