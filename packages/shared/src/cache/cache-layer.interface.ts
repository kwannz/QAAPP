export enum CacheLayer {
  L1_MEMORY = 'L1_MEMORY',
  L2_REDIS = 'L2_REDIS',
  L3_CDN = 'L3_CDN'
}

export interface CacheConfig {
  ttl: number;
  maxSize?: number;
  compression?: boolean;
  serialization?: 'json' | 'msgpack';
}

export interface MultiLayerCacheConfig {
  l1: CacheConfig & {
    maxMemoryMB: number;
    evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
  };
  l2: CacheConfig & {
    cluster: boolean;
    keyPrefix: string;
    sharding: boolean;
  };
  l3: CacheConfig & {
    provider: 'cloudflare' | 'aws' | 'nginx';
    regions: string[];
  };
}

export interface CacheKey {
  namespace: string;
  entity: string;
  id: string | number;
  version?: string;
}

export interface CacheStats {
  layer: CacheLayer;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  operationsPerSecond: number;
}

export interface CacheOperation<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<void>;
  getStats(): Promise<CacheStats>;
}