import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@qa-app/database';
import { AppWithShutdownHook } from '../database/interfaces/database.interface';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enableShutdownHooks(app: AppWithShutdownHook): Promise<void>;
}
