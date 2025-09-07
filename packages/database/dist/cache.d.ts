import { RedisClientType } from 'redis';
interface CacheConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
    lazyConnect: boolean;
}
export declare class CacheManager {
    private static instance;
    private client;
    private isConnected;
    private constructor();
    static getInstance(): CacheManager;
    initialize(config: CacheConfig): Promise<void>;
    getClient(): RedisClientType;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    get<T = any>(key: string): Promise<T | null>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    expire(key: string, seconds: number): Promise<boolean>;
    ttl(key: string): Promise<number>;
    mset(keyValues: Record<string, any>): Promise<boolean>;
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    flushAll(): Promise<boolean>;
    info(): Promise<string | null>;
    healthCheck(): Promise<boolean>;
    close(): Promise<void>;
    isReady(): boolean;
}
export declare const defaultCacheConfig: CacheConfig;
export declare const CACHE_KEYS: {
    readonly USER: "user:";
    readonly PRODUCT: "product:";
    readonly ORDER: "order:";
    readonly POSITION: "position:";
    readonly COMMISSION: "commission:";
    readonly PAYOUT: "payout:";
    readonly SESSION: "session:";
    readonly RATE_LIMIT: "rate_limit:";
};
export declare const CACHE_TTL: {
    readonly SHORT: number;
    readonly MEDIUM: number;
    readonly LONG: number;
    readonly VERY_LONG: number;
};
export declare const cacheManager: CacheManager;
export {};
//# sourceMappingURL=cache.d.ts.map