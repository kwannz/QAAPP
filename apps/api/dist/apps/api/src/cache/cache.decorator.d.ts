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
export declare const CACHE_METADATA_KEY = "cache:options";
export declare const CACHE_INVALIDATE_METADATA_KEY = "cache:invalidate";
export declare function Cacheable(options?: CacheOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function CacheEvict(options: {
    keys?: string | string[] | ((args: any[]) => string | string[]);
    condition?: (args: any[]) => boolean;
    beforeInvocation?: boolean;
    allEntries?: boolean;
}): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function CachePut(options?: CacheOptions): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare function CacheableEvict(cacheOptions?: CacheOptions, evictOptions?: Parameters<typeof CacheEvict>[0]): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
