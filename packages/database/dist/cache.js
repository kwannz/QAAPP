"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheManager = exports.CACHE_TTL = exports.CACHE_KEYS = exports.defaultCacheConfig = exports.CacheManager = void 0;
const redis_1 = require("redis");
class CacheManager {
    static instance;
    client = null;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
    // 初始化Redis客户端
    async initialize(config) {
        if (this.client) {
            return; // 已经初始化
        }
        const redisUrl = config.password
            ? `redis://:${config.password}@${config.host}:${config.port}/${config.db}`
            : `redis://${config.host}:${config.port}/${config.db}`;
        this.client = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        return new Error('Redis重连次数超过限制');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        // 监听连接事件
        this.client.on('connect', () => {
            console.log('Redis客户端正在连接...');
        });
        this.client.on('ready', () => {
            console.log('Redis客户端已就绪');
            this.isConnected = true;
        });
        this.client.on('error', (error) => {
            console.error('Redis连接错误:', error);
            this.isConnected = false;
        });
        this.client.on('end', () => {
            console.log('Redis连接已关闭');
            this.isConnected = false;
        });
        // 连接到Redis
        await this.client.connect();
    }
    // 获取Redis客户端
    getClient() {
        if (!this.client) {
            throw new Error('Redis客户端未初始化');
        }
        return this.client;
    }
    // 设置缓存
    async set(key, value, ttlSeconds) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const serializedValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serializedValue);
            }
            else {
                await this.client.set(key, serializedValue);
            }
            return true;
        }
        catch (error) {
            console.error('Redis设置缓存错误:', error);
            return false;
        }
    }
    // 获取缓存
    async get(key) {
        try {
            if (!this.isConnected) {
                return null;
            }
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Redis获取缓存错误:', error);
            return null;
        }
    }
    // 删除缓存
    async del(key) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.client.del(key);
            return result > 0;
        }
        catch (error) {
            console.error('Redis删除缓存错误:', error);
            return false;
        }
    }
    // 检查key是否存在
    async exists(key) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.client.exists(key);
            return result > 0;
        }
        catch (error) {
            console.error('Redis检查key存在性错误:', error);
            return false;
        }
    }
    // 设置过期时间
    async expire(key, seconds) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.client.expire(key, seconds);
            return result;
        }
        catch (error) {
            console.error('Redis设置过期时间错误:', error);
            return false;
        }
    }
    // 获取剩余过期时间
    async ttl(key) {
        try {
            if (!this.isConnected) {
                return -1;
            }
            return await this.client.ttl(key);
        }
        catch (error) {
            console.error('Redis获取TTL错误:', error);
            return -1;
        }
    }
    // 批量设置
    async mset(keyValues) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const serializedKeyValues = Object.entries(keyValues).reduce((acc, [key, value]) => {
                acc[key] = JSON.stringify(value);
                return acc;
            }, {});
            await this.client.mSet(serializedKeyValues);
            return true;
        }
        catch (error) {
            console.error('Redis批量设置错误:', error);
            return false;
        }
    }
    // 批量获取
    async mget(keys) {
        try {
            if (!this.isConnected) {
                return keys.map(() => null);
            }
            const values = await this.client.mGet(keys);
            return values.map(value => value ? JSON.parse(value) : null);
        }
        catch (error) {
            console.error('Redis批量获取错误:', error);
            return keys.map(() => null);
        }
    }
    // 清空所有缓存
    async flushAll() {
        try {
            if (!this.isConnected) {
                return false;
            }
            await this.client.flushAll();
            return true;
        }
        catch (error) {
            console.error('Redis清空所有缓存错误:', error);
            return false;
        }
    }
    // 获取缓存信息
    async info() {
        try {
            if (!this.isConnected) {
                return null;
            }
            return await this.client.info();
        }
        catch (error) {
            console.error('Redis获取信息错误:', error);
            return null;
        }
    }
    // 健康检查
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return false;
            }
            const pong = await this.client.ping();
            return pong === 'PONG';
        }
        catch (error) {
            console.error('Redis健康检查错误:', error);
            return false;
        }
    }
    // 关闭连接
    async close() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
        }
    }
    // 获取连接状态
    isReady() {
        return this.isConnected;
    }
}
exports.CacheManager = CacheManager;
// 默认缓存配置
exports.defaultCacheConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
};
// 缓存key前缀常量
exports.CACHE_KEYS = {
    USER: 'user:',
    PRODUCT: 'product:',
    ORDER: 'order:',
    POSITION: 'position:',
    COMMISSION: 'commission:',
    PAYOUT: 'payout:',
    SESSION: 'session:',
    RATE_LIMIT: 'rate_limit:',
};
// 缓存TTL常量 (秒)
exports.CACHE_TTL = {
    SHORT: 60 * 5, // 5分钟
    MEDIUM: 60 * 30, // 30分钟
    LONG: 60 * 60 * 2, // 2小时
    VERY_LONG: 60 * 60 * 24, // 24小时
};
// 导出单例实例
exports.cacheManager = CacheManager.getInstance();
//# sourceMappingURL=cache.js.map