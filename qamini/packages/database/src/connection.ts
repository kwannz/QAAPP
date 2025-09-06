import { Pool, PoolClient } from 'pg';
import { PrismaClient } from '@prisma/client';

// PostgreSQL连接池配置
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number; // 最大连接数
  idleTimeoutMillis: number; // 空闲超时
  connectionTimeoutMillis: number; // 连接超时
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private prisma: PrismaClient | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // 初始化PostgreSQL连接池
  initializePool(config: DatabaseConfig): void {
    if (this.pool) {
      return; // 已经初始化
    }

    this.pool = new Pool({
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
  initializePrisma(): void {
    if (this.prisma) {
      return;
    }

    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  // 获取PostgreSQL客户端
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('数据库连接池未初始化');
    }
    return await this.pool.connect();
  }

  // 获取Prisma客户端
  getPrismaClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Prisma客户端未初始化');
    }
    return this.prisma;
  }

  // 执行原始SQL查询
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // 执行事务
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 关闭所有连接
  async close(): Promise<void> {
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
  async healthCheck(): Promise<{ postgresql: boolean; prisma: boolean }> {
    const result = { postgresql: false, prisma: false };

    // 检查PostgreSQL连接
    if (this.pool) {
      try {
        const client = await this.getClient();
        await client.query('SELECT 1');
        client.release();
        result.postgresql = true;
      } catch (error) {
        console.error('PostgreSQL健康检查失败:', error);
      }
    }

    // 检查Prisma连接
    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        result.prisma = true;
      } catch (error) {
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

// 默认配置
export const defaultDatabaseConfig: DatabaseConfig = {
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
export const dbManager = DatabaseManager.getInstance();