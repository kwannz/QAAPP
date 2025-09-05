import { SetMetadata, UseInterceptors } from '@nestjs/common'
import { DeprecationInterceptor } from '../interceptors/deprecation.interceptor'

export const DEPRECATION_KEY = 'deprecation'

export interface DeprecationOptions {
  since: string
  until: string
  replacement: string
  reason?: string
}

/**
 * 标记API端点为已弃用
 * 自动添加 Deprecation 响应头和日志记录
 */
export const Deprecated = (options: DeprecationOptions): ClassDecorator & MethodDecorator => {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey !== undefined && descriptor) {
      // Method-level decorator
      SetMetadata(DEPRECATION_KEY, options)(target, propertyKey, descriptor)
      UseInterceptors(DeprecationInterceptor)(target, propertyKey, descriptor)
    } else {
      // Class-level decorator
      ;(SetMetadata(DEPRECATION_KEY, options) as ClassDecorator)(target)
      ;(UseInterceptors(DeprecationInterceptor) as ClassDecorator)(target as Function)
    }
  }
}
