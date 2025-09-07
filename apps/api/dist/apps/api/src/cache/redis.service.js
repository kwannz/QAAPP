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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importStar(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.isConnected = false;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const isCluster = this.configService.get('REDIS_CLUSTER', false);
            if (isCluster) {
                const hosts = this.configService.get('REDIS_CLUSTER_HOSTS', 'localhost:6379').split(',');
                this.client = new ioredis_1.Cluster(hosts.map(host => {
                    const [hostname, port] = host.trim().split(':');
                    return { host: hostname, port: parseInt(port) || 6379 };
                }), {
                    redisOptions: {
                        password: this.configService.get('REDIS_PASSWORD'),
                        maxRetriesPerRequest: 3,
                        lazyConnect: true
                    }
                });
            }
            else {
                this.client = new ioredis_1.default({
                    host: this.configService.get('REDIS_HOST', 'localhost'),
                    port: this.configService.get('REDIS_PORT', 6379),
                    password: this.configService.get('REDIS_PASSWORD'),
                    db: this.configService.get('REDIS_DB', 0),
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
            await this.ping();
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis connection:', error);
            throw error;
        }
    }
    async ping() {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            this.logger.error('Redis ping failed:', error);
            return false;
        }
    }
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.logger.log('Redis disconnected');
        }
    }
    async get(key) {
        this.ensureConnected();
        return await this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        this.ensureConnected();
        if (ttlSeconds) {
            return await this.client.setex(key, ttlSeconds, value);
        }
        return await this.client.set(key, value);
    }
    async del(key) {
        this.ensureConnected();
        return await this.client.del(key);
    }
    async exists(key) {
        this.ensureConnected();
        return await this.client.exists(key);
    }
    async keys(pattern) {
        this.ensureConnected();
        return await this.client.keys(pattern);
    }
    async hget(key, field) {
        this.ensureConnected();
        return await this.client.hget(key, field);
    }
    async hset(key, field, value) {
        this.ensureConnected();
        return await this.client.hset(key, field, value);
    }
    async hgetall(key) {
        this.ensureConnected();
        return await this.client.hgetall(key);
    }
    async lpush(key, ...values) {
        this.ensureConnected();
        return await this.client.lpush(key, ...values);
    }
    async rpop(key) {
        this.ensureConnected();
        return await this.client.rpop(key);
    }
    async lrange(key, start, stop) {
        this.ensureConnected();
        return await this.client.lrange(key, start, stop);
    }
    async sadd(key, ...members) {
        this.ensureConnected();
        return await this.client.sadd(key, ...members);
    }
    async smembers(key) {
        this.ensureConnected();
        return await this.client.smembers(key);
    }
    async expire(key, seconds) {
        this.ensureConnected();
        return await this.client.expire(key, seconds);
    }
    async ttl(key) {
        this.ensureConnected();
        return await this.client.ttl(key);
    }
    async multi() {
        this.ensureConnected();
        return this.client.multi();
    }
    async publish(channel, message) {
        this.ensureConnected();
        return await this.client.publish(channel, message);
    }
    async subscribe(...channels) {
        this.ensureConnected();
        await this.client.subscribe(...channels);
    }
    async info(section) {
        this.ensureConnected();
        return section ? await this.client.info(section) : await this.client.info();
    }
    async getMemoryInfo() {
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
    isHealthy() {
        return this.isConnected && this.client.status === 'ready';
    }
    getClient() {
        this.ensureConnected();
        return this.client;
    }
    ensureConnected() {
        if (!this.isConnected || this.client.status !== 'ready') {
            throw new Error('Redis connection is not available');
        }
    }
    extractInfoValue(info, key) {
        const match = info.match(new RegExp(`${key}:(\\S+)`));
        return match ? match[1] : '0';
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map