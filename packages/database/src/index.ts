// 数据库包主入口文件
export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

// 导出数据库实例
import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, validateDatabaseConfig, getEnvironment } from './config';

// 验证数据库配置
if (!validateDatabaseConfig()) {
  throw new Error('数据库配置验证失败，请检查环境变量');
}

const dbConfig = getDatabaseConfig();

// 全局数据库实例，避免在开发环境中创建多个连接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbConfig.url,
      },
    },
    log: getEnvironment() === 'development' 
      ? ['query', 'error', 'warn', 'info'] 
      : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 数据库连接状态检查
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// 数据库健康检查
export async function healthCheck(): Promise<{
  database: boolean;
  timestamp: string;
  version?: string;
}> {
  const timestamp = new Date().toISOString();
  
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      // 获取数据库版本信息
      const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
      const version = result[0]?.version;
      
      return {
        database: true,
        timestamp,
        version,
      };
    }
    
    return {
      database: false,
      timestamp,
    };
  } catch (error) {
    return {
      database: false,
      timestamp,
    };
  }
}

// 优雅关闭数据库连接
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// 监听进程退出事件，确保数据库连接正确关闭
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

// 导出配置相关函数
export * from './config';

// 导出常用的数据库操作辅助函数
export * from './utils/database-helpers';
export * from './utils/validation-helpers';