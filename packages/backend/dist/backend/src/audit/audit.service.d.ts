import { PaginationOptions, PaginatedResult, AuditLogData } from '@qa-app/database';
export declare class AuditService {
    log(data: AuditLogData): Promise<void>;
    logMany(logs: AuditLogData[]): Promise<void>;
    findMany(options: PaginationOptions & {
        actorId?: string;
        actorType?: string;
        action?: string;
        resourceType?: string;
        resourceId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<PaginatedResult<any>>;
    getUserAuditLogs(userId: string, options: PaginationOptions): Promise<PaginatedResult<any>>;
    getResourceAuditLogs(resourceType: string, resourceId: string, options: PaginationOptions): Promise<PaginatedResult<any>>;
    getActionStats(startDate?: Date, endDate?: Date): Promise<Record<string, number>>;
    getUserActivityStats(userId: string, days?: number): Promise<Array<{
        date: string;
        count: number;
    }>>;
    detectAnomalousActivity(userId: string, timeWindowHours?: number): Promise<{
        isAnomalous: boolean;
        activityCount: number;
        threshold: number;
        actions: string[];
    }>;
    cleanupOldLogs(daysToKeep?: number): Promise<number>;
    exportLogs(options: {
        startDate?: Date;
        endDate?: Date;
        actorId?: string;
        resourceType?: string;
        format: 'json' | 'csv';
    }): Promise<any>;
}
