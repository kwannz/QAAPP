import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | Cluster;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const isCluster = this.configService.get<boolean>('REDIS_CLUSTER', false);
      
      if (isCluster) {
        const hosts = this.configService.get<string>('REDIS_CLUSTER_HOSTS', 'localhost:6379').split(',');
        this.client = new Cluster(hosts.map(host => {
          const [hostname, port] = host.trim().split(':');
          return { host: hostname, port: parseInt(port) || 6379 };
        }), {
          redisOptions: {
            password: this.configService.get<string>('REDIS_PASSWORD'),
            maxRetriesPerRequest: 3,
            lazyConnect: true
          }
        });
      } else {
        this.client = new Redis({
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          password: this.configService.get<string>('REDIS_PASSWORD'),
          db: this.configService.get<number>('REDIS_DB', 0),
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
      }

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('✅ Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        this.logger.error('❌ Redis connection error:', error);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('⚠️ Redis connection closed');
      });

      await this.client.connect();
      
      // 测试连接
      await this.ping();
      
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.logger.log('Redis disconnected');
    }
  }

  // 基础操作
  async get(key: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string> {
    this.ensureConnected();
    if (ttlSeconds) {
      return await this.client.setex(key, ttlSeconds, value);
    }
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client.exists(key);
  }

  async keys(pattern: string): Promise<string[]> {
    this.ensureConnected();
    return await this.client.keys(pattern);
  }

  // Hash 操作
  async hget(key: string, field: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    this.ensureConnected();
    return await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    this.ensureConnected();
    return await this.client.hgetall(key);
  }

  // List 操作
  async lpush(key: string, ...values: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client.lpush(key, ...values);
  }

  async rpop(key: string): Promise<string | null> {
    this.ensureConnected();
    return await this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    this.ensureConnected();
    return await this.client.lrange(key, start, stop);
  }

  // Set 操作
  async sadd(key: string, ...members: string[]): Promise<number> {
    this.ensureConnected();
    return await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    this.ensureConnected();
    return await this.client.smembers(key);
  }

  // 过期时间操作
  async expire(key: string, seconds: number): Promise<number> {
    this.ensureConnected();
    return await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    this.ensureConnected();
    return await this.client.ttl(key);
  }

  // 事务操作
  async multi(): Promise<any> {
    this.ensureConnected();
    return this.client.multi();
  }

  // 发布订阅
  async publish(channel: string, message: string): Promise<number> {
    this.ensureConnected();
    return await this.client.publish(channel, message);
  }

  async subscribe(...channels: string[]): Promise<void> {
    this.ensureConnected();
    await this.client.subscribe(...channels);
  }

  // 获取 Redis 信息
  async info(section?: string): Promise<string> {
    this.ensureConnected();
    return await this.client.info(section);
  }

  // 获取内存统计
  async getMemoryInfo(): Promise<{
    used: number;
    peak: number;
    fragmentation: number;
  }> {
    const info = await this.info('memory');
    const used = this.extractInfoValue(info, 'used_memory');
    const peak = this.extractInfoValue(info, 'used_memory_peak');
    const fragmentation = this.extractInfoValue(info, 'mem_fragmentation_ratio');
    
    return {
      used: parseInt(used) || 0,
      peak: parseInt(peak) || 0,
      fragmentation: parseFloat(fragmentation) || 1
    };
  }

  // 获取连接状态
  isHealthy(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  // 获取原始客户端 (用于高级操作)
  getClient(): Redis | Cluster {
    this.ensureConnected();
    return this.client;
  }

  private ensureConnected(): void {
    if (!this.isConnected || this.client.status !== 'ready') {
      throw new Error('Redis connection is not available');
    }
  }

  private extractInfoValue(info: string, key: string): string {
    const match = info.match(new RegExp(`${key}:(\\S+)`));
    return match ? match[1] : '0';
  }
}