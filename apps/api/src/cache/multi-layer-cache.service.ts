import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';
import { LRUCache } from 'lru-cache';
import * as msgpack from 'msgpack-lite';
import {
  CacheLayer,
  CacheOperation,
  CacheStats,
  MultiLayerCacheConfig,
  CacheKey
} from '@qa-app/shared';

interface CacheItem<T = any> {
  value: T;
  expiry: number;
  version: string;
  hitCount: number;
}

@Injectable()
export class MultiLayerCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MultiLayerCacheService.name);
  private l1Cache: LRUCache<string, CacheItem>;
  private l2Cache: Redis | Cluster;
  private config: MultiLayerCacheConfig;
  private stats: Map<CacheLayer, CacheStats> = new Map();

  constructor(private configService: ConfigService) {
    this.config = this.loadCacheConfig();
    this.initializeL1Cache();
    
    // 只有在L2启用时才初始化Redis
    const l2Enabled = this.configService.get<string>('CACHE_L2_ENABLED') === 'true';
    if (l2Enabled) {
      this.initializeL2Cache();
    } else {
      this.logger.log('L2 Redis cache disabled by configuration');
    }
    
    this.initializeStats();
  }

  async onModuleInit() {
    this.logger.log('Multi-layer cache service initialized');
    await this.startStatsCollection();
  }

  async onModuleDestroy() {
    if (this.l2Cache) {
      await this.l2Cache.disconnect();
    }
    this.l1Cache.clear();
  }

  private loadCacheConfig(): MultiLayerCacheConfig {
    return {
      l1: {
        ttl: this.configService.get<number>('CACHE_L1_TTL', 300000), // 5 minutes
        maxMemoryMB: this.configService.get<number>('CACHE_L1_MEMORY_MB', 128),
        evictionPolicy: 'LRU',
        serialization: 'json'
      },
      l2: {
        ttl: this.configService.get<number>('CACHE_L2_TTL', 3600000), // 1 hour
        cluster: this.configService.get<boolean>('REDIS_CLUSTER', false),
        keyPrefix: 'qaapp:',
        sharding: true,
        compression: true,
        serialization: 'msgpack'
      },
      l3: {
        ttl: this.configService.get<number>('CACHE_L3_TTL', 86400000), // 24 hours
        provider: 'cloudflare',
        regions: ['us-east', 'eu-west', 'ap-southeast'],
        compression: true,
        serialization: 'json'
      }
    };
  }

  private initializeL1Cache() {
    const maxItems = Math.floor(
      (this.config.l1.maxMemoryMB * 1024 * 1024) / 1024 // Average item size 1KB
    );

    this.l1Cache = new LRUCache<string, CacheItem>({
      max: maxItems,
      ttl: this.config.l1.ttl,
      allowStale: false,
      updateAgeOnGet: true
    });
  }

  private initializeL2Cache() {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.config.l2.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    };

    if (this.config.l2.cluster) {
      const hosts = this.configService.get<string>('REDIS_CLUSTER_HOSTS', '').split(',');
      this.l2Cache = new Cluster(hosts.map(host => {
        const [hostname, port] = host.split(':');
        return { host: hostname, port: parseInt(port) };
      }), {
        redisOptions: redisConfig
      });
    } else {
      this.l2Cache = new Redis(redisConfig);
    }
  }

  private initializeStats() {
    const layers = [CacheLayer.L1_MEMORY, CacheLayer.L2_REDIS, CacheLayer.L3_CDN];
    layers.forEach(layer => {
      this.stats.set(layer, {
        layer,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        memoryUsage: 0,
        operationsPerSecond: 0
      });
    });
  }

  /**
   * 多层缓存获取策略
   * L1 → L2 → Database/API → 反向填充缓存
   */
  async get<T>(key: string, loader?: () => Promise<T>): Promise<T | null> {
    const startTime = Date.now();
    let result: T | null = null;
    let hitLayer: CacheLayer | null = null;

    try {
      // L1 Cache Check
      const l1Item = this.l1Cache.get(key);
      if (l1Item && l1Item.expiry > Date.now()) {
        l1Item.hitCount++;
        result = l1Item.value;
        hitLayer = CacheLayer.L1_MEMORY;
        this.updateStats(CacheLayer.L1_MEMORY, true, Date.now() - startTime);
        return result;
      }

      // L2 Cache Check (只有在L2启用时才检查)
      if (this.l2Cache) {
        const l2Data = await this.l2Cache.get(key);
        if (l2Data) {
          const l2Item = this.deserialize(l2Data, this.config.l2.serialization as 'json' | 'msgpack');
          if (l2Item && l2Item.expiry > Date.now()) {
            result = l2Item.value;
            hitLayer = CacheLayer.L2_REDIS;
            
            // 回填L1缓存
            await this.setL1(key, result, this.config.l1.ttl);
            
            this.updateStats(CacheLayer.L2_REDIS, true, Date.now() - startTime);
            this.updateStats(CacheLayer.L1_MEMORY, false, 0);
            return result;
          }
        }
      }

      // 缓存未命中，使用loader加载数据
      if (loader) {
        result = await loader();
        if (result !== null) {
          // 多层缓存写入
          await Promise.all([
            this.setL1(key, result, this.config.l1.ttl),
            this.setL2(key, result, this.config.l2.ttl)
          ]);
        }
      }

      this.updateStats(CacheLayer.L1_MEMORY, false, Date.now() - startTime);
      this.updateStats(CacheLayer.L2_REDIS, false, Date.now() - startTime);
      
      return result;

    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      if (loader) {
        return await loader();
      }
      return null;
    }
  }

  /**
   * 多层缓存设置策略
   * 同时写入L1和L2，异步写入L3
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    
    try {
      const l1Ttl = ttl || this.config.l1.ttl;
      const l2Ttl = ttl || this.config.l2.ttl;

      // 写入L1，如果L2启用则也写入L2
      const promises = [this.setL1(key, value, l1Ttl)];
      
      if (this.l2Cache) {
        promises.push(this.setL2(key, value, l2Ttl));
      }
      
      await Promise.all(promises);

      // 异步写入L3 (CDN)
      this.setL3(key, value, ttl || this.config.l3.ttl).catch(error => {
        this.logger.warn(`L3 cache write failed for key ${key}:`, error);
      });

    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
      throw error;
    }
  }

  private async setL1<T>(key: string, value: T, ttl: number): Promise<void> {
    const cacheItem: CacheItem<T> = {
      value,
      expiry: Date.now() + ttl,
      version: this.generateVersion(),
      hitCount: 0
    };
    
    this.l1Cache.set(key, cacheItem, { ttl });
  }

  private async setL2<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.l2Cache) {
      return; // L2未启用，直接返回
    }
    
    const cacheItem: CacheItem<T> = {
      value,
      expiry: Date.now() + ttl,
      version: this.generateVersion(),
      hitCount: 0
    };

    const serializedData = this.serialize(cacheItem, this.config.l2.serialization as 'json' | 'msgpack');
    await this.l2Cache.setex(key, Math.floor(ttl / 1000), serializedData);
  }

  private async setL3<T>(key: string, value: T, ttl: number): Promise<void> {
    // L3 CDN 缓存实现（根据具体CDN提供商）
    // 这里提供Cloudflare Workers KV示例
    if (this.config.l3.provider === 'cloudflare') {
      // 实际项目中需要Cloudflare API集成
      this.logger.debug(`L3 CDN cache set: ${key}`);
    }
  }

  /**
   * 缓存失效策略
   * 支持模式匹配批量删除
   */
  async delete(keyOrPattern: string): Promise<boolean> {
    try {
      let deleted = false;

      // 判断是否为模式匹配
      if (keyOrPattern.includes('*') || keyOrPattern.includes('?')) {
        // 批量删除
        const keys = await this.getKeysByPattern(keyOrPattern);
        const promises = [this.deleteBatchL1(keys)];
        
        if (this.l2Cache) {
          promises.push(this.deleteBatchL2(keys));
        }
        
        await Promise.all(promises);
        deleted = keys.length > 0;
      } else {
        // 单个删除
        const promises = [this.deleteL1(keyOrPattern)];
        
        if (this.l2Cache) {
          promises.push(this.deleteL2(keyOrPattern));
        }
        
        await Promise.all(promises);
        deleted = true;
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Cache delete error for ${keyOrPattern}:`, error);
      return false;
    }
  }

  private deleteL1(key: string): boolean {
    return this.l1Cache.delete(key);
  }

  private async deleteL2(key: string): Promise<number> {
    if (!this.l2Cache) {
      return 0;
    }
    return await this.l2Cache.del(key);
  }

  private deleteBatchL1(keys: string[]): void {
    keys.forEach(key => this.l1Cache.delete(key));
  }

  private async deleteBatchL2(keys: string[]): Promise<number> {
    if (keys.length === 0 || !this.l2Cache) return 0;
    return await this.l2Cache.del(...keys);
  }

  private async getKeysByPattern(pattern: string): Promise<string[]> {
    // L1缓存模式匹配
    const l1Keys = Array.from(this.l1Cache.keys()).filter(key => 
      this.matchPattern(key, pattern)
    );

    // L2缓存模式匹配（如果L2启用）
    let l2Keys: string[] = [];
    if (this.l2Cache) {
      l2Keys = await this.l2Cache.keys(pattern);
    }
    
    return [...new Set([...l1Keys, ...l2Keys])];
  }

  private matchPattern(str: string, pattern: string): boolean {
    const regex = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regex}$`).test(str);
  }

  /**
   * 缓存预热策略
   */
  async warmup(keys: Array<{ key: string; loader: () => Promise<any> }>): Promise<void> {
    this.logger.log(`Starting cache warmup for ${keys.length} keys`);
    
    const batchSize = 10;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ({ key, loader }) => {
          try {
            const value = await loader();
            await this.set(key, value);
          } catch (error) {
            this.logger.warn(`Warmup failed for key ${key}:`, error);
          }
        })
      );
    }
    
    this.logger.log('Cache warmup completed');
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<Map<CacheLayer, CacheStats>> {
    // 更新L1统计
    const l1Stats = this.stats.get(CacheLayer.L1_MEMORY)!;
    l1Stats.memoryUsage = this.l1Cache.size * 1024; // 估算内存使用

    // 更新L2统计（如果L2启用）
    if (this.l2Cache) {
      const l2Info = await this.l2Cache.info('memory');
      const l2Stats = this.stats.get(CacheLayer.L2_REDIS)!;
      l2Stats.memoryUsage = this.parseRedisMemoryUsage(l2Info);
    }

    return this.stats;
  }

  private updateStats(layer: CacheLayer, hit: boolean, responseTime: number): void {
    const stats = this.stats.get(layer)!;
    if (hit) {
      stats.hitRate = (stats.hitRate * 0.9) + (1 * 0.1); // 加权平均
    } else {
      stats.missRate = (stats.missRate * 0.9) + (1 * 0.1);
    }
    stats.operationsPerSecond = 1000 / responseTime;
  }

  private serialize(data: any, format: 'json' | 'msgpack'): string {
    switch (format) {
      case 'msgpack':
        return Buffer.from(msgpack.encode(data)).toString('base64');
      case 'json':
      default:
        return JSON.stringify(data);
    }
  }

  private deserialize(data: string, format: 'json' | 'msgpack'): any {
    try {
      switch (format) {
        case 'msgpack':
          return msgpack.decode(Buffer.from(data, 'base64'));
        case 'json':
        default:
          return JSON.parse(data);
      }
    } catch (error) {
      this.logger.error('Deserialization error:', error);
      return null;
    }
  }

  private generateVersion(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private parseRedisMemoryUsage(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private async startStatsCollection(): Promise<void> {
    setInterval(async () => {
      try {
        await this.getStats();
      } catch (error) {
        this.logger.error('Stats collection error:', error);
      }
    }, 10000); // 每10秒更新一次统计
  }

  /**
   * 构建缓存键
   */
  buildKey(namespace: string, entity: string, id: string | number, version?: string): string {
    const parts = [namespace, entity, id.toString()];
    if (version) {
      parts.push(version);
    }
    return parts.join(':');
  }

  /**
   * 缓存健康检查
   */
  async healthCheck(): Promise<{ l1: boolean; l2: boolean; l3: boolean }> {
    const testKey = 'health:check';
    const testValue = { timestamp: Date.now() };

    try {
      const results = await Promise.allSettled([
        // L1 健康检查
        (async () => {
          await this.setL1(testKey, testValue, 1000);
          const result = this.l1Cache.get(testKey);
          return result !== undefined;
        })(),
        
        // L2 健康检查（如果L2启用）
        (async () => {
          if (this.l2Cache) {
            await this.l2Cache.ping();
            return true;
          }
          return false; // L2未启用
        })(),
        
        // L3 健康检查
        Promise.resolve(true) // CDN健康检查实现
      ]);

      return {
        l1: results[0].status === 'fulfilled' && results[0].value,
        l2: results[1].status === 'fulfilled' && results[1].value,
        l3: results[2].status === 'fulfilled' && results[2].value
      };
    } catch (error) {
      this.logger.error('Health check error:', error);
      return { l1: false, l2: false, l3: false };
    }
  }
}