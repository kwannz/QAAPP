import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@qa-app/database';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // 记录数据库查询日志
    this.$on('query' as never, (e: any) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(e);
    });

    this.$on('info' as never, (e: any) => {
      this.logger.log(e);
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(e);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connection established successfully');
      
      // 测试数据库连接
      const result = await this.$queryRaw`SELECT 1 as test`;
      this.logger.log('🔍 Database health check passed', result);
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database connection closed');
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}