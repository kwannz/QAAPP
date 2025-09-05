import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@qa-app/database';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';
import { PrismaQueryEvent, PrismaErrorEvent, PrismaInfoEvent, PrismaWarnEvent, AppWithShutdownHook } from './interfaces/database.interface';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: nodeEnv === 'development' ? [
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
      ] : [
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // 记录数据库查询日志
    this.$on('query' as never, (e: PrismaQueryEvent) => {
      this.logger.debug(`Query: ${e.query}`);
      this.logger.debug(`Duration: ${e.duration}ms`);
    });

    this.$on('error' as never, (e: PrismaErrorEvent) => {
      this.logger.error(e);
    });

    this.$on('info' as never, (e: PrismaInfoEvent) => {
      this.logger.log(e);
    });

    this.$on('warn' as never, (e: PrismaWarnEvent) => {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      this.logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: getErrorMessage(error), timestamp: new Date().toISOString() };
    }
  }
}