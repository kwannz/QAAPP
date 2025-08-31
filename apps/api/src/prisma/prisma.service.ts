import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('DatabaseService') private prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}