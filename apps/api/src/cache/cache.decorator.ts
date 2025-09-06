import { SetMetadata, applyDecorators } from '@nestjs/common';
import { CacheLayer } from '../../../../packages/shared/src/types/cache.types';

export interface CacheOptions {
  key?: string | ((args: any[]) => string);
  ttl?: number;
  layers?: CacheLayer[];
  condition?: (args: any[]) => boolean;
  unless?: (result: any) => boolean;
  serialize?: boolean;
  tags?: string[];
}

export const CACHE_METADATA_KEY = 'cache:options';
export const CACHE_INVALIDATE_METADATA_KEY = 'cache:invalidate';

/**
 * 缓存装饰器 - 自动缓存方法结果
 */
export function Cacheable(options: CacheOptions = {}) {
  return applyDecorators(
    SetMetadata(CACHE_METADATA_KEY, options)
  );
}

/**
 * 缓存失效装饰器 - 方法执行后自动失效相关缓存
 */
export function CacheEvict(options: {
  keys?: string | string[] | ((args: any[]) => string | string[]);
  condition?: (args: any[]) => boolean;
  beforeInvocation?: boolean;
  allEntries?: boolean;
}) {
  return applyDecorators(
    SetMetadata(CACHE_INVALIDATE_METADATA_KEY, options)
  );
}

/**
 * 缓存更新装饰器 - 方法执行后自动更新缓存
 */
export function CachePut(options: CacheOptions = {}) {
  return applyDecorators(
    SetMetadata(CACHE_METADATA_KEY, { ...options, forcePut: true })
  );
}

/**
 * 组合装饰器 - 同时支持缓存和失效
 */
export function CacheableEvict(
  cacheOptions: CacheOptions = {},
  evictOptions: Parameters<typeof CacheEvict>[0] = {}
) {
  return applyDecorators(
    Cacheable(cacheOptions),
    CacheEvict(evictOptions)
  );
}