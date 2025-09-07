"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MultiLayerCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLayerCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importStar(require("ioredis"));
const LRU = __importStar(require("lru-cache"));
const cache_types_1 = require("../types/cache.types");
let MultiLayerCacheService = MultiLayerCacheService_1 = class MultiLayerCacheService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MultiLayerCacheService_1.name);
        this.stats = new Map();
        this.config = this.loadCacheConfig();
        this.initializeL1Cache();
        this.initializeL2Cache();
        this.initializeStats();
    }
    async onModuleInit() {
        this.logger.log('Multi-layer cache service initialized');
        await this.startStatsCollection();
    }
    async onModuleDestroy() {
        this.logger.log('Cleaning up Multi-Layer Cache Service...');
        if (this.statsCollectionIntervalId) {
            clearInterval(this.statsCollectionIntervalId);
        }
        await this.l2Cache.disconnect();
        this.l1Cache.clear();
        this.logger.log('Multi-Layer Cache Service cleanup completed');
    }
    loadCacheConfig() {
        return {
            l1: {
                ttl: this.configService.get('CACHE_L1_TTL', 300000),
                maxMemoryMB: this.configService.get('CACHE_L1_MEMORY_MB', 128),
                evictionPolicy: 'LRU',
                serialization: 'json'
            },
            l2: {
                ttl: this.configService.get('CACHE_L2_TTL', 3600000),
                cluster: this.configService.get('REDIS_CLUSTER', false),
                keyPrefix: 'qaapp:',
                sharding: true,
                compression: true,
                serialization: 'msgpack'
            },
            l3: {
                ttl: this.configService.get('CACHE_L3_TTL', 86400000),
                provider: 'cloudflare',
                regions: ['us-east', 'eu-west', 'ap-southeast'],
                compression: true,
                serialization: 'json'
            }
        };
    }
    initializeL1Cache() {
        const maxItems = Math.floor((this.config.l1.maxMemoryMB * 1024 * 1024) / 1024);
        const LruCtor = LRU.LRUCache || LRU.default || LRU;
        this.l1Cache = new LruCtor({
            max: maxItems,
            ttl: this.config.l1.ttl,
            allowStale: false,
            updateAgeOnGet: true
        });
    }
    initializeL2Cache() {
        const redisConfig = {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            db: this.configService.get('REDIS_DB', 0),
            keyPrefix: this.config.l2.keyPrefix,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true
        };
        if (this.config.l2.cluster) {
            const hosts = this.configService.get('REDIS_CLUSTER_HOSTS', '').split(',');
            this.l2Cache = new ioredis_1.Cluster(hosts.map(host => {
                const [hostname, port] = host.split(':');
                return { host: hostname, port: parseInt(port) };
            }), {
                redisOptions: redisConfig
            });
        }
        else {
            this.l2Cache = new ioredis_1.default(redisConfig);
        }
    }
    initializeStats() {
        const layers = [cache_types_1.CacheLayer.L1_MEMORY, cache_types_1.CacheLayer.L2_REDIS, cache_types_1.CacheLayer.L3_CDN];
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
    async get(key, loader) {
        const startTime = Date.now();
        let result = null;
        let hitLayer = null;
        try {
            const l1Item = this.l1Cache.get(key);
            if (l1Item && l1Item.expiry > Date.now()) {
                l1Item.hitCount++;
                result = l1Item.value;
                hitLayer = cache_types_1.CacheLayer.L1_MEMORY;
                this.updateStats(cache_types_1.CacheLayer.L1_MEMORY, true, Date.now() - startTime);
                return result;
            }
            const l2Data = await this.l2Cache.get(key);
            if (l2Data) {
                const l2Item = this.deserialize(l2Data, this.config.l2.serialization);
                if (l2Item && l2Item.expiry > Date.now()) {
                    result = l2Item.value;
                    hitLayer = cache_types_1.CacheLayer.L2_REDIS;
                    await this.setL1(key, result, this.config.l1.ttl);
                    this.updateStats(cache_types_1.CacheLayer.L2_REDIS, true, Date.now() - startTime);
                    this.updateStats(cache_types_1.CacheLayer.L1_MEMORY, false, 0);
                    return result;
                }
            }
            if (loader) {
                result = await loader();
                if (result !== null) {
                    await Promise.all([
                        this.setL1(key, result, this.config.l1.ttl),
                        this.setL2(key, result, this.config.l2.ttl)
                    ]);
                }
            }
            this.updateStats(cache_types_1.CacheLayer.L1_MEMORY, false, Date.now() - startTime);
            this.updateStats(cache_types_1.CacheLayer.L2_REDIS, false, Date.now() - startTime);
            return result;
        }
        catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error);
            if (loader) {
                return await loader();
            }
            return null;
        }
    }
    async set(key, value, ttl) {
        const startTime = Date.now();
        try {
            const l1Ttl = ttl || this.config.l1.ttl;
            const l2Ttl = ttl || this.config.l2.ttl;
            await Promise.all([
                this.setL1(key, value, l1Ttl),
                this.setL2(key, value, l2Ttl)
            ]);
            this.setL3(key, value, ttl || this.config.l3.ttl).catch(error => {
                this.logger.warn(`L3 cache write failed for key ${key}:`, error);
            });
        }
        catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error);
            throw error;
        }
    }
    async setL1(key, value, ttl) {
        const cacheItem = {
            value,
            expiry: Date.now() + ttl,
            version: this.generateVersion(),
            hitCount: 0
        };
        this.l1Cache.set(key, cacheItem, { ttl });
    }
    async setL2(key, value, ttl) {
        const cacheItem = {
            value,
            expiry: Date.now() + ttl,
            version: this.generateVersion(),
            hitCount: 0
        };
        const serializedData = this.serialize(cacheItem, this.config.l2.serialization);
        await this.l2Cache.setex(key, Math.floor(ttl / 1000), serializedData);
    }
    async setL3(key, value, ttl) {
        if (this.config.l3.provider === 'cloudflare') {
            this.logger.debug(`L3 CDN cache set: ${key}`);
        }
    }
    async delete(keyOrPattern) {
        try {
            let deleted = false;
            if (keyOrPattern.includes('*') || keyOrPattern.includes('?')) {
                const keys = await this.getKeysByPattern(keyOrPattern);
                await Promise.all([
                    this.deleteBatchL1(keys),
                    this.deleteBatchL2(keys)
                ]);
                deleted = keys.length > 0;
            }
            else {
                await Promise.all([
                    this.deleteL1(keyOrPattern),
                    this.deleteL2(keyOrPattern)
                ]);
                deleted = true;
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Cache delete error for ${keyOrPattern}:`, error);
            return false;
        }
    }
    deleteL1(key) {
        return this.l1Cache.delete(key);
    }
    async deleteL2(key) {
        return await this.l2Cache.del(key);
    }
    deleteBatchL1(keys) {
        keys.forEach(key => this.l1Cache.delete(key));
    }
    async deleteBatchL2(keys) {
        if (keys.length === 0)
            return 0;
        return await this.l2Cache.del(...keys);
    }
    async getKeysByPattern(pattern) {
        const l1Keys = Array.from(this.l1Cache.keys())
            .filter((key) => this.matchPattern(key, pattern));
        const l2Keys = await this.l2Cache.keys(pattern);
        return [...new Set([...l1Keys, ...l2Keys])];
    }
    matchPattern(str, pattern) {
        const regex = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp(`^${regex}$`).test(str);
    }
    async warmup(keys) {
        this.logger.log(`Starting cache warmup for ${keys.length} keys`);
        const batchSize = 10;
        for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);
            await Promise.all(batch.map(async ({ key, loader }) => {
                try {
                    const value = await loader();
                    await this.set(key, value);
                }
                catch (error) {
                    this.logger.warn(`Warmup failed for key ${key}:`, error);
                }
            }));
        }
        this.logger.log('Cache warmup completed');
    }
    async getStats() {
        const l1Stats = this.stats.get(cache_types_1.CacheLayer.L1_MEMORY);
        l1Stats.memoryUsage = this.l1Cache.size * 1024;
        const l2Info = await this.l2Cache.info('memory');
        const l2Stats = this.stats.get(cache_types_1.CacheLayer.L2_REDIS);
        l2Stats.memoryUsage = this.parseRedisMemoryUsage(l2Info);
        return this.stats;
    }
    updateStats(layer, hit, responseTime) {
        const stats = this.stats.get(layer);
        if (hit) {
            stats.hitRate = (stats.hitRate * 0.9) + (1 * 0.1);
        }
        else {
            stats.missRate = (stats.missRate * 0.9) + (1 * 0.1);
        }
        stats.operationsPerSecond = 1000 / responseTime;
    }
    serialize(data, format) {
        switch (format) {
            case 'msgpack':
                return JSON.stringify(data);
            case 'json':
            default:
                return JSON.stringify(data);
        }
    }
    deserialize(data, format) {
        try {
            switch (format) {
                case 'msgpack':
                    return JSON.parse(data);
                case 'json':
                default:
                    return JSON.parse(data);
            }
        }
        catch (error) {
            this.logger.error('Deserialization error:', error);
            return null;
        }
    }
    generateVersion() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    parseRedisMemoryUsage(info) {
        const match = info.match(/used_memory:(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }
    async startStatsCollection() {
        this.statsCollectionIntervalId = setInterval(async () => {
            try {
                await this.getStats();
            }
            catch (error) {
                this.logger.error('Stats collection error:', error);
            }
        }, 10000);
    }
    buildKey(namespace, entity, id, version) {
        const parts = [namespace, entity, id.toString()];
        if (version) {
            parts.push(version);
        }
        return parts.join(':');
    }
    async healthCheck() {
        const testKey = 'health:check';
        const testValue = { timestamp: Date.now() };
        try {
            const results = await Promise.allSettled([
                (async () => {
                    await this.setL1(testKey, testValue, 1000);
                    const result = this.l1Cache.get(testKey);
                    return result !== undefined;
                })(),
                (async () => {
                    await this.l2Cache.ping();
                    return true;
                })(),
                Promise.resolve(true)
            ]);
            return {
                l1: results[0].status === 'fulfilled' && results[0].value,
                l2: results[1].status === 'fulfilled' && results[1].value,
                l3: results[2].status === 'fulfilled' && results[2].value
            };
        }
        catch (error) {
            this.logger.error('Health check error:', error);
            return { l1: false, l2: false, l3: false };
        }
    }
};
exports.MultiLayerCacheService = MultiLayerCacheService;
exports.MultiLayerCacheService = MultiLayerCacheService = MultiLayerCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MultiLayerCacheService);
//# sourceMappingURL=multi-layer-cache.service.js.map