import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MonitoringInterceptor.name);

  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const startTime = Date.now();
    const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 添加请求ID到headers用于追踪
    response.setHeader('X-Request-ID', requestId);
    
    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          
          // 记录基本请求指标
          this.metricsService.recordRequest(
            request.method,
            request.path,
            response.statusCode,
            duration
          );

          // 记录请求日志
          this.logger.log(
            `${request.method} ${request.path} - ${response.statusCode} - ${duration}ms`
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
          // 记录错误指标（状态码500）
          this.metricsService.recordRequest(
            request.method,
            request.path,
            500,
            duration
          );
          
          // 记录错误日志
          this.logger.error(
            `${request.method} ${request.path} - ERROR - ${duration}ms: ${error.message}`,
            error.stack
          );
        },
      }),
    );
  }
}