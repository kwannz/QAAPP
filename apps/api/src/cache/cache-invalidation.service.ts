import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MultiLayerCacheService } from './multi-layer-cache.service';

export interface CacheInvalidationEvent {
  entity: string;
  id?: string | number;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  userId?: number;
  metadata?: Record<string, any>;
}

interface InvalidationRule {
  entity: string;
  patterns: string[];
  dependencies: string[];
  delay?: number; // 延迟失效（毫秒）
}

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly invalidationRules: Map<string, InvalidationRule> = new Map();
  private readonly delayedInvalidations = new Map<string, NodeJS.Timeout>();

  constructor(
    private cacheService: MultiLayerCacheService,
    private eventEmitter: EventEmitter2
  ) {
    this.setupInvalidationRules();
  }

  private setupInvalidationRules(): void {
    const rules: InvalidationRule[] = [
      {
        entity: 'user',
        patterns: [
          'user:*',
          'user:profile:*',
          'user:permissions:*',
          'user:audit:*'
        ],
        dependencies: ['audit_logs', 'user_permissions']
      },
      {
        entity: 'position',
        patterns: [
          'position:*',
          'position:user:*',
          'market:position:*',
          'analytics:position:*'
        ],
        dependencies: ['user', 'audit_logs'],
        delay: 1000 // 延迟1秒失效，避免频繁更新
      },
      {
        entity: 'order',
        patterns: [
          'order:*',
          'order:user:*',
          'order:position:*',
          'analytics:order:*'
        ],
        dependencies: ['position', 'user', 'audit_logs']
      },
      {
        entity: 'audit_log',
        patterns: [
          'audit:*',
          'audit:user:*',
          'audit:entity:*'
        ],
        dependencies: []
      },
      {
        entity: 'market_data',
        patterns: [
          'market:*',
          'market:symbol:*',
          'analytics:market:*'
        ],
        dependencies: ['position'],
        delay: 5000 // 市场数据延迟失效，减少缓存压力
      }
    ];

    rules.forEach(rule => {
      this.invalidationRules.set(rule.entity, rule);
    });

    this.logger.log(`Loaded ${rules.length} cache invalidation rules`);
  }

  /**
   * 监听用户相关事件
   */
  @OnEvent('user.*')
  async handleUserEvent(event: CacheInvalidationEvent): Promise<void> {
    this.logger.debug(`User event: ${event.action} for user ${event.id}`);
    await this.invalidateEntity('user', event.id?.toString());
  }

  /**
   * 监听位置相关事件
   */
  @OnEvent('position.*')
  async handlePositionEvent(event: CacheInvalidationEvent): Promise<void> {
    this.logger.debug(`Position event: ${event.action} for position ${event.id}`);
    await this.invalidateEntity('position', event.id?.toString());
    
    // 位置变更影响用户相关缓存
    if (event.userId) {
      await this.invalidateUserRelated(event.userId);
    }
  }

  /**
   * 监听订单相关事件
   */
  @OnEvent('order.*')
  async handleOrderEvent(event: CacheInvalidationEvent): Promise<void> {
    this.logger.debug(`Order event: ${event.action} for order ${event.id}`);
    await this.invalidateEntity('order', event.id?.toString());
    
    // 订单变更影响用户和位置相关缓存
    if (event.userId) {
      await this.invalidateUserRelated(event.userId);
    }
    
    if (event.metadata?.positionId) {
      await this.invalidateEntity('position', event.metadata.positionId);
    }
  }

  /**
   * 监听审计日志事件
   */
  @OnEvent('audit.*')
  async handleAuditEvent(event: CacheInvalidationEvent): Promise<void> {
    this.logger.debug(`Audit event: ${event.action} for audit ${event.id}`);
    await this.invalidateEntity('audit_log', event.id?.toString());
  }

  /**
   * 监听市场数据事件
   */
  @OnEvent('market.*')
  async handleMarketEvent(event: CacheInvalidationEvent): Promise<void> {
    this.logger.debug(`Market event: ${event.action} for symbol ${event.id}`);
    await this.invalidateEntity('market_data', event.id?.toString());
  }

  /**
   * 实体缓存失效处理
   */
  private async invalidateEntity(entity: string, id?: string): Promise<void> {
    const rule = this.invalidationRules.get(entity);
    if (!rule) {
      this.logger.warn(`No invalidation rule found for entity: ${entity}`);
      return;
    }

    const invalidationKey = `${entity}:${id || 'all'}`;

    // 处理延迟失效
    if (rule.delay) {
      this.handleDelayedInvalidation(invalidationKey, rule, id);
      return;
    }

    await this.executeInvalidation(rule, id);
  }

  /**
   * 延迟失效处理
   */
  private handleDelayedInvalidation(key: string, rule: InvalidationRule, id?: string): void {
    // 清除已存在的延迟失效
    if (this.delayedInvalidations.has(key)) {
      clearTimeout(this.delayedInvalidations.get(key)!);
    }

    // 设置新的延迟失效
    const timeout = setTimeout(async () => {
      await this.executeInvalidation(rule, id);
      this.delayedInvalidations.delete(key);
    }, rule.delay);

    this.delayedInvalidations.set(key, timeout);
    this.logger.debug(`Scheduled delayed invalidation for ${key} in ${rule.delay}ms`);
  }

  /**
   * 执行缓存失效
   */
  private async executeInvalidation(rule: InvalidationRule, id?: string): Promise<void> {
    const patterns = rule.patterns.map(pattern => 
      id ? pattern.replace('*', id) : pattern
    );

    // 并行执行所有模式的失效
    const invalidationPromises = patterns.map(async pattern => {
      try {
        const deleted = await this.cacheService.delete(pattern);
        this.logger.debug(`Invalidated cache pattern: ${pattern}, deleted: ${deleted}`);
        return { pattern, success: true, deleted };
      } catch (error) {
        this.logger.error(`Failed to invalidate cache pattern: ${pattern}`, error);
        return { pattern, success: false, error };
      }
    });

    const results = await Promise.allSettled(invalidationPromises);
    const failedCount = results.filter(r => r.status === 'rejected').length;
    
    if (failedCount > 0) {
      this.logger.warn(`Cache invalidation completed with ${failedCount} failures for entity: ${rule.entity}`);
    } else {
      this.logger.debug(`Cache invalidation completed successfully for entity: ${rule.entity}`);
    }

    // 处理依赖实体的失效
    await this.handleDependencyInvalidation(rule.dependencies, id);
  }

  /**
   * 处理依赖实体失效
   */
  private async handleDependencyInvalidation(dependencies: string[], id?: string): Promise<void> {
    if (dependencies.length === 0) return;

    const dependencyPromises = dependencies.map(dep => 
      this.invalidateEntity(dep, id)
    );

    await Promise.allSettled(dependencyPromises);
  }

  /**
   * 失效用户相关所有缓存
   */
  private async invalidateUserRelated(userId: number): Promise<void> {
    const userPatterns = [
      `user:${userId}:*`,
      `position:user:${userId}:*`,
      `order:user:${userId}:*`,
      `audit:user:${userId}:*`
    ];

    await Promise.all(
      userPatterns.map(pattern => this.cacheService.delete(pattern))
    );
  }

  /**
   * 手动触发缓存失效
   */
  async manualInvalidate(entity: string, id?: string | number, reason?: string): Promise<void> {
    this.logger.log(`Manual cache invalidation: entity=${entity}, id=${id}, reason=${reason}`);
    
    const event: CacheInvalidationEvent = {
      entity,
      id,
      action: 'update',
      timestamp: Date.now(),
      metadata: { reason, manual: true }
    };

    this.eventEmitter.emit(`${entity}.manual`, event);
  }

  /**
   * 批量失效
   */
  async batchInvalidate(entities: Array<{ entity: string; id?: string | number }>): Promise<void> {
    this.logger.log(`Batch cache invalidation for ${entities.length} entities`);
    
    const promises = entities.map(({ entity, id }) => 
      this.invalidateEntity(entity, id?.toString())
    );

    await Promise.allSettled(promises);
  }

  /**
   * 全局缓存清理（慎用）
   */
  async globalClear(confirmation: string): Promise<void> {
    if (confirmation !== 'CONFIRM_GLOBAL_CLEAR') {
      throw new Error('Invalid confirmation for global cache clear');
    }

    this.logger.warn('Executing global cache clear');
    
    // 清理所有延迟失效
    this.delayedInvalidations.forEach(timeout => clearTimeout(timeout));
    this.delayedInvalidations.clear();

    // 执行全局清理
    await this.cacheService.delete('*');
    
    this.logger.warn('Global cache clear completed');
  }

  /**
   * 获取失效统计
   */
  async getInvalidationStats(): Promise<{
    rules: number;
    delayedInvalidations: number;
    recentInvalidations: Array<{
      pattern: string;
      timestamp: number;
      success: boolean;
    }>;
  }> {
    return {
      rules: this.invalidationRules.size,
      delayedInvalidations: this.delayedInvalidations.size,
      recentInvalidations: [] // 实际项目中可以维护一个LRU队列记录最近的失效操作
    };
  }
}