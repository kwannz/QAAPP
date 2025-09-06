import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { DEPRECATION_KEY, DeprecationOptions } from '../decorators/deprecated.decorator'

@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DeprecationInterceptor.name)

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    
    const deprecationOptions = this.reflector.get<DeprecationOptions>(
      DEPRECATION_KEY,
      context.getHandler()
    )

    if (!deprecationOptions) {
      return next.handle()
    }

    // 添加 Deprecation 响应头
    response.setHeader('Deprecation', deprecationOptions.since)
    response.setHeader('X-Deprecated-Since', deprecationOptions.since)
    response.setHeader('X-Deprecated-Until', deprecationOptions.until)
    response.setHeader('X-Deprecated-Replacement', deprecationOptions.replacement)
    
    if (deprecationOptions.reason) {
      response.setHeader('X-Deprecated-Reason', deprecationOptions.reason)
    }

    return next.handle().pipe(
      tap(() => {
        // 记录弃用API调用
        this.logger.warn(`Deprecated API called: ${request.method} ${request.url}`, {
          deprecation: deprecationOptions,
          userAgent: request.get('User-Agent'),
          ip: request.ip,
          userId: request.user?.id,
          timestamp: new Date().toISOString(),
        })

        // 发送指标到监控系统
        this.recordDeprecationMetric(request, deprecationOptions)
      })
    )
  }

  private recordDeprecationMetric(request: any, options: DeprecationOptions) {
    try {
      // 这里可以发送到你的监控系统 (Prometheus, DataDog 等)
      const metric = {
        type: 'api_deprecation_usage',
        endpoint: `${request.method} ${request.route?.path || request.url}`,
        since: options.since,
        replacement: options.replacement,
        timestamp: Date.now(),
        count: 1
      }

      // 暂时记录到日志，将来可以发送到时序数据库
      this.logger.log('Deprecation metric recorded', metric)
    } catch (error) {
      this.logger.error('Failed to record deprecation metric', error)
    }
  }
}