import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { MultiLayerCacheService } from './multi-layer-cache.service';
import { CacheInvalidationService } from './cache-invalidation.service';
import {
  CACHE_METADATA_KEY,
  CACHE_INVALIDATE_METADATA_KEY,
  CacheOptions
} from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private reflector: Reflector,
    private cacheService: MultiLayerCacheService,
    private invalidationService: CacheInvalidationService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheOptions = this.reflector.get<CacheOptions>(
      CACHE_METADATA_KEY,
      context.getHandler()
    );

    const invalidateOptions = this.reflector.get(
      CACHE_INVALIDATE_METADATA_KEY,
      context.getHandler()
    );

    // 如果没有缓存配置，直接执行
    if (!cacheOptions && !invalidateOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const args = this.extractArguments(context);
    const methodName = context.getHandler().name;
    const className = context.getClass().name;

    // 处理缓存逻辑
    if (cacheOptions) {
      return this.handleCache(
        cacheOptions,
        args,
        methodName,
        className,
        request,
        next
      );
    }

    // 处理失效逻辑
    if (invalidateOptions) {
      return this.handleInvalidation(
        invalidateOptions,
        args,
        next
      );
    }

    return next.handle();
  }

  private handleCache(
    options: CacheOptions,
    args: any[],
    methodName: string,
    className: string,
    request: any,
    next: CallHandler
  ): Observable<any> {
    // 检查条件
    if (options.condition && !options.condition(args)) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(options.key, args, methodName, className, request);

    // 强制更新缓存
    if ((options as any).forcePut) {
      return next.handle().pipe(
        tap(async (result) => {
          if (!options.unless || !options.unless(result)) {
            await this.cacheService.set(cacheKey, result, options.ttl);
            this.logger.debug(`Cache put: ${cacheKey}`);
          }
        })
      );
    }

    // 尝试从缓存获取
    return from(this.cacheService.get(cacheKey)).pipe(
      switchMap((cachedResult) => {
        if (cachedResult !== null) {
          this.logger.debug(`Cache hit: ${cacheKey}`);
          return of(cachedResult);
        }

        // 缓存未命中，执行方法并缓存结果
        return next.handle().pipe(
          tap(async (result) => {
            if (!options.unless || !options.unless(result)) {
              await this.cacheService.set(cacheKey, result, options.ttl);
              this.logger.debug(`Cache miss, cached result: ${cacheKey}`);
            }
          })
        );
      })
    );
  }

  private handleInvalidation(
    options: any,
    args: any[],
    next: CallHandler
  ): Observable<any> {
    // 前置失效
    if (options.beforeInvocation) {
      return from(this.executeInvalidation(options, args)).pipe(
        switchMap(() => next.handle())
      );
    }

    // 后置失效
    return next.handle().pipe(
      tap(async () => {
        if (!options.condition || options.condition(args)) {
          await this.executeInvalidation(options, args);
        }
      })
    );
  }

  private async executeInvalidation(options: any, args: any[]): Promise<void> {
    let keysToInvalidate: string[] = [];

    if (options.allEntries) {
      keysToInvalidate = ['*'];
    } else if (options.keys) {
      if (typeof options.keys === 'function') {
        const result = options.keys(args);
        keysToInvalidate = Array.isArray(result) ? result : [result];
      } else if (Array.isArray(options.keys)) {
        keysToInvalidate = options.keys;
      } else {
        keysToInvalidate = [options.keys];
      }
    }

    // 执行失效操作
    for (const key of keysToInvalidate) {
      await this.cacheService.delete(key);
      this.logger.debug(`Cache evicted: ${key}`);
    }
  }

  private generateCacheKey(
    keyOption: string | ((args: any[]) => string) | undefined,
    args: any[],
    methodName: string,
    className: string,
    request: any
  ): string {
    if (typeof keyOption === 'function') {
      return keyOption(args);
    }

    if (typeof keyOption === 'string') {
      return this.interpolateKey(keyOption, args, request);
    }

    // 默认键生成策略
    const keyParts = [className, methodName];
    
    // 添加参数到键中
    if (args && args.length > 0) {
      const argString = args
        .filter(arg => arg !== undefined && arg !== null)
        .map(arg => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg);
          }
          return String(arg);
        })
        .join(':');
      keyParts.push(argString);
    }

    // 添加用户上下文（如果存在）
    if (request?.user?.id) {
      keyParts.push(`user:${request.user.id}`);
    }

    return keyParts.join(':');
  }

  private interpolateKey(template: string, args: any[], request: any): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      // 从参数中查找
      for (let i = 0; i < args.length; i++) {
        if (args[i] && typeof args[i] === 'object' && args[i][key] !== undefined) {
          return String(args[i][key]);
        }
      }
      
      // 从请求对象中查找
      if (request && request[key] !== undefined) {
        return String(request[key]);
      }
      
      // 从用户对象中查找
      if (request?.user && request.user[key] !== undefined) {
        return String(request.user[key]);
      }

      return match; // 保持原样
    });
  }

  private extractArguments(context: ExecutionContext): any[] {
    const type = context.getType();
    
    if (type === 'http') {
      const request = context.switchToHttp().getRequest();
      return [request.params, request.query, request.body].filter(Boolean);
    }
    
    if (type === 'ws') {
      return [context.switchToWs().getData()];
    }
    
    if (type === 'rpc') {
      return [context.switchToRpc().getData()];
    }

    return [];
  }
}