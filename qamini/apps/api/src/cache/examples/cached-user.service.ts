import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../../users/users.service';
import { Cacheable, CacheEvict, CachePut } from '../cache.decorator';
import { CacheLayer } from '../../../../../packages/shared/src/types/cache.types';
import { MultiLayerCacheService } from '../multi-layer-cache.service';
import { CacheInvalidationService } from '../cache-invalidation.service';

@Injectable()
export class CachedUserService {
  private readonly logger = new Logger(CachedUserService.name);

  constructor(
    private userService: UsersService,
    private eventEmitter: EventEmitter2,
    private cacheService: MultiLayerCacheService,
    private invalidationService: CacheInvalidationService
  ) {}

  /**
   * 获取用户详情 - 多层缓存，30分钟TTL
   */
  @Cacheable({
    key: 'user:profile:{id}',
    ttl: 1800000, // 30 minutes
    layers: [CacheLayer.L1_MEMORY, CacheLayer.L2_REDIS],
    tags: ['user', 'profile']
  })
  async getUserProfile(id: number) {
    this.logger.debug(`Loading user profile from database: ${id}`);
    return await this.userService.findById(id);
  }

  /**
   * 获取用户权限 - 高频访问，L1缓存优先
   */
  @Cacheable({
    key: (args) => `user:permissions:${args[0]}`,
    ttl: 600000, // 10 minutes
    layers: [CacheLayer.L1_MEMORY],
    condition: (args) => args[0] && args[0] > 0
  })
  async getUserPermissions(userId: number) {
    this.logger.debug(`Loading user permissions from database: ${userId}`);
    return await this.userService.getUserPermissions(userId);
  }

  /**
   * 获取用户统计 - 计算密集型，长缓存
   */
  @Cacheable({
    key: 'user:stats:{userId}:daily',
    ttl: 3600000, // 1 hour
    layers: [CacheLayer.L2_REDIS, CacheLayer.L3_CDN],
    unless: (result) => !result || result.totalTrades === 0
  })
  async getUserDailyStats(userId: number) {
    this.logger.debug(`Calculating user daily stats: ${userId}`);
    return await this.userService.calculateDailyStats(userId);
  }

  /**
   * 更新用户资料 - 自动失效相关缓存
   */
  @CacheEvict({
    keys: (args) => [
      `user:profile:${args[0]}`,
      `user:permissions:${args[0]}`,
      `user:stats:${args[0]}:*`
    ]
  })
  async updateUserProfile(id: number, data: any) {
    this.logger.log(`Updating user profile: ${id}`);
    const result = await this.userService.update(id, data);
    
    // 触发相关事件
    this.eventEmitter.emit('user.updated', {
      entity: 'user',
      id,
      action: 'update',
      timestamp: Date.now(),
      metadata: data
    });
    
    return result;
  }

  /**
   * 缓存用户会话信息 - 强制更新缓存
   */
  @CachePut({
    key: 'user:session:{userId}',
    ttl: 7200000, // 2 hours
    layers: [CacheLayer.L1_MEMORY, CacheLayer.L2_REDIS]
  })
  async updateUserSession(userId: number, sessionData: any) {
    this.logger.debug(`Updating user session cache: ${userId}`);
    return sessionData;
  }

  /**
   * 获取用户列表 - 分页缓存
   */
  @Cacheable({
    key: (args) => `users:list:page:${args[0]?.page || 1}:size:${args[0]?.size || 20}:sort:${args[0]?.sort || 'id'}`,
    ttl: 300000, // 5 minutes
    layers: [CacheLayer.L2_REDIS],
    condition: (args) => args[0] && args[0].page && args[0].page <= 100 // 只缓存前100页
  })
  async getUserList(params: { page: number; size: number; sort?: string }) {
    this.logger.debug(`Loading user list from database:`, params);
    return await this.userService.findMany(params);
  }

  /**
   * 预热用户缓存 - 系统启动时调用
   */
  async warmupUserCache(userIds: number[]): Promise<void> {
    this.logger.log(`Warming up user cache for ${userIds.length} users`);
    
    const warmupTasks = userIds.map(id => ({
      key: `user:profile:${id}`,
      loader: () => this.userService.findById(id)
    }));

    // 使用缓存服务的预热功能
    await this.cacheService.warmup(warmupTasks);
  }

  /**
   * 清理用户缓存 - 管理功能
   */
  @CacheEvict({
    keys: (args) => args[0] ? [`user:*:${args[0]}`] : ['user:*'],
    condition: (args) => args.length === 0 || args[0] > 0
  })
  async clearUserCache(userId?: number): Promise<void> {
    this.logger.warn(`Clearing user cache${userId ? ` for user ${userId}` : ' (all users)'}`);
    
    if (!userId) {
      // 全局用户缓存清理需要额外确认
      await this.invalidationService.manualInvalidate('user', undefined, 'Admin cleanup');
    }
  }
}