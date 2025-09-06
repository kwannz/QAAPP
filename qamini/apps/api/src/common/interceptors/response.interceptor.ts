import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    // 生成或获取请求ID
    const requestId = (
      (Array.isArray(request.headers['x-request-id']) 
        ? request.headers['x-request-id'][0] 
        : request.headers['x-request-id']) ||
      (Array.isArray(request.headers['x-correlation-id']) 
        ? request.headers['x-correlation-id'][0] 
        : request.headers['x-correlation-id']) ||
      this.generateRequestId()
    ) as string;

    // 添加请求ID到响应头
    response.setHeader('X-Request-ID', requestId);
    
    // 记录请求开始时间
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 记录请求日志
        this.logRequest(request, response, duration, requestId);

        // 处理特殊响应类型
        if (this.isSpecialResponse(data)) {
          return data;
        }

        // 构造标准响应格式
        const apiResponse: ApiResponse<T> = {
          success: true,
          data: data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            version: process.env.API_VERSION || '1.0.0',
          },
        };

        // 添加分页信息（如果存在）
        if (data && typeof data === 'object' && 'pagination' in data) {
          apiResponse.pagination = (data as any).pagination;
          apiResponse.data = (data as any).data || (data as any).items;
        }

        // 添加消息（如果存在）
        if (data && typeof data === 'object' && 'message' in data) {
          apiResponse.message = (data as any).message;
        }

        return apiResponse;
      }),
    );
  }

  private isSpecialResponse(data: any): boolean {
    // 检查是否已经是标准格式的响应
    if (data && typeof data === 'object' && 'success' in data) {
      return true;
    }

    // 检查是否是文件下载等特殊响应
    if (data instanceof Buffer || data instanceof Uint8Array) {
      return true;
    }

    return false;
  }

  private logRequest(
    request: Request,
    response: Response,
    duration: number,
    requestId: string,
  ): void {
    const logData = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      contentLength: response.get('content-length'),
    };

    if (duration > 1000) {
      this.logger.warn(
        `Slow request detected: ${request.method} ${request.url}`,
        JSON.stringify(logData, null, 2),
      );
    } else {
      this.logger.log(
        `${request.method} ${request.url} - ${response.statusCode} - ${duration}ms`,
        'RequestLog',
      );
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}