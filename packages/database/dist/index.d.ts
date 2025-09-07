export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';
export { Decimal } from '@prisma/client/runtime/library';
export { UserRole, KycStatus, OrderStatus, PositionStatus, CommissionType, CommissionStatus, WithdrawalStatus, WithdrawalType, RiskLevel } from '@prisma/client';
export * from './connection';
export * from './cache';
import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function checkDatabaseConnection(): Promise<boolean>;
export declare function healthCheck(): Promise<{
    database: boolean;
    timestamp: string;
    version?: string;
}>;
export declare function disconnectDatabase(): Promise<void>;
export * from './config';
export * from './utils/database-helpers';
export * from './utils/validation-helpers';
//# sourceMappingURL=index.d.ts.map