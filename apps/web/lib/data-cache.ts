/**
 * 前端数据缓存策略
 * 支持多层缓存、失效策略和实时同步
 */

import React from 'react';

interface CacheEntry<T = any> {
  data: T | string  // string when compressed, T when not compressed
  timestamp: number
  ttl: number
  version: string
  tags: string[]
  compressed?: boolean
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  compressionThreshold: number
  enableMemoryCache: boolean
  enableLocalStorage: boolean
  enableIndexedDB: boolean
}

interface CacheStats {
  hitRate: number
  missRate: number
  totalRequests: number
  memoryUsage: number
  storageUsage: number
  lastCleanup: Date
}

class DataCacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private requestCache = new Map<string, Promise<any>>();
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5分钟
    maxSize: 100, // 最大缓存项数
    compressionThreshold: 50_000, // 50KB以上启用压缩
    enableMemoryCache: true,
    enableLocalStorage: true,
    enableIndexedDB: false, // 复杂数据使用IndexedDB
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
    this.stats = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      memoryUsage: 0,
      storageUsage: 0,
      lastCleanup: new Date(),
    };

    this.startCleanupInterval();
    this.loadFromStorage();
  }

  /**
   * 获取缓存数据
   */
  async get<T = any>(key: string): Promise<T | null> {
    this.stats.totalRequests++;

    try {
      // 1. 检查内存缓存
      if (this.config.enableMemoryCache && this.memoryCache.has(key)) {
        const entry = this.memoryCache.get(key);

        if (this.isEntryValid(entry)) {
          this.stats.hitRate = this.calculateHitRate(true);
          return entry.compressed ? this.decompress(entry.data as string) : (entry.data as T);
        }
          this.memoryCache.delete(key);
      }

      // 2. 检查LocalStorage缓存
      if (this.config.enableLocalStorage) {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          try {
            const entry: CacheEntry<T> = JSON.parse(stored);

            if (this.isEntryValid(entry)) {
              // 恢复到内存缓存
              this.memoryCache.set(key, entry);
              this.stats.hitRate = this.calculateHitRate(true);
              return entry.compressed ? this.decompress(entry.data as string) : (entry.data as T);
            }
              localStorage.removeItem(`cache_${key}`);
          } catch {
            localStorage.removeItem(`cache_${key}`);
          }
        }
      }

      // 3. IndexedDB缓存（浏览器持久化存储）
      if (this.config.enableIndexedDB && typeof window !== 'undefined') {
        try {
          const idbValue = await this.getFromIndexedDB(key);
          if (idbValue && !this.isExpired(idbValue)) {
            this.stats.hitRate = this.calculateHitRate(true);
            return idbValue.compressed ? this.decompress(idbValue.data as string) : (idbValue.data as T);
          }
        } catch (error) {
          console.warn('IndexedDB cache error:', error);
        }
      }

      this.stats.missRate = this.calculateHitRate(false);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   */
  async set<T = any>(
    key: string,
    data: T,
    options?: {
      ttl?: number
      tags?: string[]
      compress?: boolean
      skipMemory?: boolean
      skipStorage?: boolean
    },
  ): Promise<void> {
    try {
      const ttl = options?.ttl || this.config.defaultTTL;
      const tags = options?.tags || [];
      const compress = options?.compress || this.shouldCompress(data);

      const entry: CacheEntry<T> = {
        data: compress ? this.compress(data) : data,
        timestamp: Date.now(),
        ttl,
        version: this.generateVersion(),
        tags,
        compressed: compress,
      };

      // 内存缓存
      if (this.config.enableMemoryCache && !options?.skipMemory) {
        this.memoryCache.set(key, entry);
        this.enforceMemoryLimit();
      }

      // LocalStorage缓存
      if (this.config.enableLocalStorage && !options?.skipStorage) {
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
        } catch {
          // LocalStorage满了，清理旧数据
          this.cleanupLocalStorage();
          try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
          } catch (retryError) {
            console.warn('Failed to save to localStorage:', retryError);
          }
        }
      }

      this.updateStorageStats();
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  /**
   * 根据标签清除缓存
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    // 清理内存缓存
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key);
      }
    }

    // 清理LocalStorage缓存
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (entry.tags?.some((tag: string) => tags.includes(tag))) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) localStorage.removeItem(key);
  }

  /**
   * 防抖请求缓存
   */
  async getOrFetch<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number
      tags?: string[]
      forceRefresh?: boolean
    },
  ): Promise<T> {
    // 检查是否强制刷新
    if (!options?.forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // 防止重复请求
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key);
    }

    // 创建请求Promise
    const requestPromise = fetcher().then(data => {
      this.set(key, data, options);
      this.requestCache.delete(key);
      return data;
    }).catch(error => {
      this.requestCache.delete(key);
      throw error;
    });

    this.requestCache.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 清除所有缓存
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.requestCache.clear();

    // 清理LocalStorage中的缓存项
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) localStorage.removeItem(key);

    this.stats = {
      ...this.stats,
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      lastCleanup: new Date(),
    };
  }

  // 私有方法

  private isEntryValid(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  private shouldCompress(data: any): boolean {
    const { size } = new Blob([JSON.stringify(data)]);
    return size > this.config.compressionThreshold;
  }

  private compress(data: any): string {
    // 简单的JSON字符串压缩（实际项目中可能需要更复杂的压缩算法）
    return JSON.stringify(data);
  }

  private decompress(data: string): any {
    return JSON.parse(data);
  }

  private isExpired(entry: CacheEntry, ttl?: number): boolean {
    if (!entry) return true;
    const entryTTL = ttl === undefined ? entry.ttl : ttl;
    return Date.now() - entry.timestamp > entryTTL;
  }

  private async getFromIndexedDB<T = any>(key: string): Promise<CacheEntry<T> | null> {
    if (typeof window === 'undefined' || !window.indexedDB) return null;

    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('DataCache', 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains('cache')) {
            resolve(null);
            return;
          }

          const transaction = database.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const getRequest = store.get(key);

          getRequest.onsuccess = () => resolve(getRequest.result || null);
          getRequest.onerror = () => reject(getRequest.error);
        };

        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains('cache')) {
            database.createObjectStore('cache');
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB get error:', error);
      return null;
    }
  }

  private generateVersion(): string {
    return `v${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.config.maxSize) return;

    // LRU清理策略：删除最旧的条目
    const entries = [...this.memoryCache.entries()];
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toDelete = this.memoryCache.size - this.config.maxSize + 10; // 多删除10个避免频繁清理
    for (let index = 0; index < toDelete && index < entries.length; index++) {
      this.memoryCache.delete(entries[index][0]);
    }
  }

  private cleanupLocalStorage(): void {
    const cacheKeys: Array<{ key: string; timestamp: number }> = [];

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          cacheKeys.push({ key, timestamp: entry.timestamp });
        } catch {
          localStorage.removeItem(key);
        }
      }
    }

    // 删除最旧的25%缓存项
    cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
    const deleteCount = Math.ceil(cacheKeys.length * 0.25);

    for (let index = 0; index < deleteCount; index++) {
      localStorage.removeItem(cacheKeys[index].key);
    }
  }

  private calculateHitRate(isHit: boolean): number {
    if (isHit) {
      return ((this.stats.hitRate * (this.stats.totalRequests - 1)) + 1) / this.stats.totalRequests;
    }
      return (this.stats.hitRate * (this.stats.totalRequests - 1)) / this.stats.totalRequests;
  }

  private updateStorageStats(): void {
    let memoryUsage = 0;
    for (const entry of this.memoryCache.values()) {
      memoryUsage += new Blob([JSON.stringify(entry)]).size;
    }

    let storageUsage = 0;
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_')) {
        const value = localStorage.getItem(key);
        if (value) {
          storageUsage += new Blob([value]).size;
        }
      }
    }

    this.stats.memoryUsage = memoryUsage;
    this.stats.storageUsage = storageUsage;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60_000); // 每分钟清理一次过期条目
  }

  private cleanupExpiredEntries(): void {
    // 清理内存中的过期条目
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // 清理LocalStorage中的过期条目
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (!this.isEntryValid(entry)) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) localStorage.removeItem(key);
    this.stats.lastCleanup = new Date();
  }

  private loadFromStorage(): void {
    // 预加载LocalStorage中的有效缓存到内存
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && key.startsWith('cache_') && this.memoryCache.size < this.config.maxSize / 2) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          const cacheKey = key.replace('cache_', '');

          if (this.isEntryValid(entry)) {
            this.memoryCache.set(cacheKey, entry);
          } else {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryCache.clear();
    this.requestCache.clear();
  }
}

// 创建全局缓存管理器实例
export const dataCache = new DataCacheManager();

/**
 * React Hook for cached API calls
 */
export function useCachedData<T = any>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number
    tags?: string[]
    enabled?: boolean
    dependencies?: any[]
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  },
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [lastFetch, setLastFetch] = React.useState<Date | null>(null);

  const fetchData = React.useCallback(async (forceRefresh = false) => {
    if (options?.enabled === false) return;

    try {
      setLoading(true);
      setError(null);

      const result = await dataCache.getOrFetch(key, fetcher, {
        ttl: options?.ttl,
        tags: options?.tags,
        forceRefresh,
      });

      setData(result);
      setLastFetch(new Date());

      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (error_) {
      const error = error_ instanceof Error ? error_ : new Error('Unknown error');
      setError(error);

      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options]);

  // 依赖变化时重新获取
  React.useEffect(() => {
    fetchData();
  }, options?.dependencies || []);

  // 提供手动刷新方法
  const refresh = React.useCallback(async () => {
    return fetchData(true);
  }, [fetchData]);

  // 清除当前key的缓存
  const clearCache = React.useCallback(() => {
    dataCache.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    clearCache,
  };
}

/**
 * 智能缓存预热工具
 */
export class CachePreloader {
  private preloadQueue: Array<{ key: string; priority: number; fetcher: () => Promise<any>; ttl?: number }> = [];
  private isPreloading = false;

  constructor(private cache: DataCacheManager) {}

  async preloadRoutes(routes: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    const promises = routes.map(async route =>
      this.cache.set(route.key, route.fetcher, { ttl: route.ttl }),
    );

    await Promise.allSettled(promises);
  }

  async preloadUserData(userId: string) {
    const userRoutes = [
      {
        key: `user_${userId}`,
        fetcher: async () => fetch(`/api/users/${userId}`).then(async r => r.json()),
        ttl: 10 * 60 * 1000, // 10分钟
      },
      {
        key: `user_permissions_${userId}`,
        fetcher: async () => fetch(`/api/users/${userId}/permissions`).then(async r => r.json()),
        ttl: 30 * 60 * 1000, // 30分钟
      },
    ];

    await this.preloadRoutes(userRoutes);
  }

  async preloadDashboardData(userRole: string) {
    const dashboardRoutes = [
      {
        key: 'dashboard_metrics',
        fetcher: async () => fetch('/api/dashboard/metrics').then(async r => r.json()),
        ttl: 2 * 60 * 1000, // 2分钟
      },
      {
        key: `dashboard_${userRole.toLowerCase()}`,
        fetcher: async () => fetch(`/api/dashboard/${userRole.toLowerCase()}`).then(async r => r.json()),
        ttl: 5 * 60 * 1000, // 5分钟
      },
    ];

    await this.preloadRoutes(dashboardRoutes);
  }

  /**
   * 智能预热：根据用户行为模式预加载数据
   */
  async intelligentPreload(userRole: string, userId: string, recentPages: string[] = []) {
    console.log('🚀 启动智能缓存预热...');

    // 基础数据（高优先级）
    await this.addToPreloadQueue([
      {
        key: 'system_config',
        priority: 10,
        fetcher: async () => fetch('/api/config').then(async r => r.json()),
        ttl: 60 * 60 * 1000, // 1小时
      },
      {
        key: 'user_permissions',
        priority: 9,
        fetcher: async () => fetch(`/api/users/${userId}/permissions`).then(async r => r.json()),
        ttl: 30 * 60 * 1000, // 30分钟
      },
    ]);

    // 角色相关数据（中优先级）
    if (userRole === 'ADMIN') {
      await this.addToPreloadQueue([
        {
          key: 'admin_dashboard_metrics',
          priority: 8,
          fetcher: async () => fetch('/api/monitoring/metrics').then(async r => r.json()),
          ttl: 2 * 60 * 1000,
        },
        {
          key: 'admin_transaction_stats',
          priority: 7,
          fetcher: async () => fetch('/api/finance/transactions/stats/overview').then(async r => r.json()),
          ttl: 5 * 60 * 1000,
        },
      ]);
    }

    // 基于页面访问历史的预测性加载（低优先级）
    const predictiveRoutes = this.generatePredictiveRoutes(recentPages, userRole);
    await this.addToPreloadQueue(predictiveRoutes);

    // 执行队列
    await this.processPreloadQueue();
  }

  private async addToPreloadQueue(routes: Array<{ key: string; priority: number; fetcher: () => Promise<any>; ttl?: number }>) {
    this.preloadQueue.push(...routes);
    this.preloadQueue.sort((a, b) => b.priority - a.priority); // 高优先级优先
  }

  private generatePredictiveRoutes(recentPages: string[], userRole: string): Array<{ key: string; priority: number; fetcher: () => Promise<any>; ttl?: number }> {
    const routes: Array<{ key: string; priority: number; fetcher: () => Promise<any>; ttl?: number }> = [];

    // 预测用户可能访问的页面
    if (recentPages.includes('/admin/operations')) {
      routes.push({
        key: 'predictive_users_list',
        priority: 5,
        fetcher: async () => fetch('/api/users?limit=50').then(async r => r.json()),
        ttl: 10 * 60 * 1000,
      });
    }

    if (recentPages.includes('/admin/analytics')) {
      routes.push({
        key: 'predictive_reports_data',
        priority: 4,
        fetcher: async () => fetch('/api/reports/summary').then(async r => r.json()),
        ttl: 15 * 60 * 1000,
      });
    }

    return routes;
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;

    try {
      // 分批处理，避免同时发起太多请求
      const batchSize = 5;
      for (let index = 0; index < this.preloadQueue.length; index += batchSize) {
        const batch = this.preloadQueue.slice(index, index + batchSize);
        const results = await Promise.allSettled(
          batch.map(async route => this.cache.set(route.key, route.fetcher, { ttl: route.ttl })),
        );

        for (const result of results) {
          if (result.status === 'fulfilled') {
            successful++;
          } else {
            failed++;
          }
        }

        // 批次间延迟，避免服务器压力
        if (index + batchSize < this.preloadQueue.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ 缓存预热完成: ${successful}成功, ${failed}失败, 耗时${duration}ms`);
    } catch (error) {
      console.error('Cache preload error:', error);
    } finally {
      this.preloadQueue = [];
      this.isPreloading = false;
    }
  }

  /**
   * 预测性缓存更新
   */
  async predictiveCacheUpdate(currentRoute: string, userBehavior: any) {
    const predictions = this.analyzeBehaviorPatterns(currentRoute, userBehavior);

    for (const prediction of predictions) {
      // 低优先级后台更新，不阻塞用户操作
      setTimeout(() => {
        this.cache.getOrFetch(prediction.cacheKey, prediction.fetcher, {
          ttl: prediction.ttl,
        }).catch(error => {
          console.debug('Predictive cache update failed:', error);
        });
      }, 1000);
    }
  }

  private analyzeBehaviorPatterns(currentRoute: string, userBehavior: any): Array<{
    cacheKey: string
    fetcher: () => Promise<any>
    ttl: number
  }> {
    const predictions: Array<{ cacheKey: string; fetcher: () => Promise<any>; ttl: number }> = [];

    // 基于当前路由预测下一步操作
    if (currentRoute.includes('/operations') && userBehavior.recentActions?.includes('view_users')) {
      predictions.push({
        cacheKey: 'predicted_user_details',
        fetcher: async () => fetch('/api/users/recent').then(async r => r.json()),
        ttl: 5 * 60 * 1000,
      });
    }

    if (currentRoute.includes('/analytics') && userBehavior.timeOfDay === 'morning') {
      predictions.push({
        cacheKey: 'predicted_daily_reports',
        fetcher: async () => fetch('/api/reports/daily').then(async r => r.json()),
        ttl: 15 * 60 * 1000,
      });
    }

    return predictions;
  }
}

// 创建全局预加载器实例
export const cachePreloader = new CachePreloader(dataCache);

/**
 * 缓存调试工具
 */
export const cacheDebugger = {
  getStats: () => dataCache.getStats(),
  viewCache: () => {
    const stats = dataCache.getStats();
    console.table(stats);
    return stats;
  },
  clearAll: async () => dataCache.clearAll(),
  testCache: async () => {
    const testKey = 'test_cache_key';
    const testData = { message: 'Hello Cache!', timestamp: new Date() };

    console.time('Cache Set');
    await dataCache.set(testKey, testData);
    console.timeEnd('Cache Set');

    console.time('Cache Get');
    const result = await dataCache.get(testKey);
    console.timeEnd('Cache Get');

    console.log('Cache test result:', { original: testData, cached: result });
    await dataCache.delete(testKey);

    return result;
  },
};

// 在开发环境中暴露调试工具到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).cacheDebugger = cacheDebugger;
}

export default DataCacheManager;
