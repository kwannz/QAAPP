import { PoolClient } from 'pg';
import { PrismaClient } from '@prisma/client';
interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}
export declare class DatabaseManager {
    private static instance;
    private pool;
    private prisma;
    private constructor();
    static getInstance(): DatabaseManager;
    initializePool(config: DatabaseConfig): void;
    initializePrisma(): void;
    getClient(): Promise<PoolClient>;
    getPrismaClient(): PrismaClient;
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    healthCheck(): Promise<{
        postgresql: boolean;
        prisma: boolean;
    }>;
    getPoolStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    } | null;
}
export declare const defaultDatabaseConfig: DatabaseConfig;
export declare const dbManager: DatabaseManager;
export {};
//# sourceMappingURL=connection.d.ts.map