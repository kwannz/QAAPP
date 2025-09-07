"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbManager = exports.defaultDatabaseConfig = exports.DatabaseManager = void 0;
const pg_1 = require("pg");
const client_1 = require("@prisma/client");
class DatabaseManager {
    static instance;
    pool = null;
    prisma = null;
    constructor() { }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    // 初始化PostgreSQL连接池
    initializePool(config) {
        if (this.pool) {
            return; // 已经初始化
        }
        this.pool = new pg_1.Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
        // 监听连接事件
        this.pool.on('connect', (client) => {
            console.log('PostgreSQL客户端已连接');
        });
        this.pool.on('error', (err) => {
            console.error('PostgreSQL连接池错误:', err);
        });
    }
    // 初始化Prisma客户端
    initializePrisma() {
        if (this.prisma) {
            return;
        }
        this.prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }
    // 获取PostgreSQL客户端
    async getClient() {
        if (!this.pool) {
            throw new Error('数据库连接池未初始化');
        }
        return await this.pool.connect();
    }
    // 获取Prisma客户端
    getPrismaClient() {
        if (!this.prisma) {
            throw new Error('Prisma客户端未初始化');
        }
        return this.prisma;
    }
    // 执行原始SQL查询
    async query(text, params) {
        const client = await this.getClient();
        try {
            const result = await client.query(text, params);
            return result;
        }
        finally {
            client.release();
        }
    }
    // 执行事务
    async transaction(callback) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // 关闭所有连接
    async close() {
        if (this.prisma) {
            await this.prisma.$disconnect();
            this.prisma = null;
        }
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
    // 健康检查
    async healthCheck() {
        const result = { postgresql: false, prisma: false };
        // 检查PostgreSQL连接
        if (this.pool) {
            try {
                const client = await this.getClient();
                await client.query('SELECT 1');
                client.release();
                result.postgresql = true;
            }
            catch (error) {
                console.error('PostgreSQL健康检查失败:', error);
            }
        }
        // 检查Prisma连接
        if (this.prisma) {
            try {
                await this.prisma.$queryRaw `SELECT 1`;
                result.prisma = true;
            }
            catch (error) {
                console.error('Prisma健康检查失败:', error);
            }
        }
        return result;
    }
    // 获取连接池统计信息
    getPoolStats() {
        if (!this.pool) {
            return null;
        }
        return {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount,
        };
    }
}
exports.DatabaseManager = DatabaseManager;
// 默认配置
exports.defaultDatabaseConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'qa_database',
    user: process.env.POSTGRES_USER || 'qa_user',
    password: process.env.POSTGRES_PASSWORD || 'qa_password',
    max: 20, // 最大20个连接
    idleTimeoutMillis: 30000, // 30秒空闲超时
    connectionTimeoutMillis: 2000, // 2秒连接超时
};
// 导出单例实例
exports.dbManager = DatabaseManager.getInstance();
//# sourceMappingURL=connection.js.map