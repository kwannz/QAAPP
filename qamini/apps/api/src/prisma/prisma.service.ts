import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@qa-app/database';
import { AppWithShutdownHook } from '../database/interfaces/database.interface';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: AppWithShutdownHook) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}