import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getMyAuditLogs(userId: string, page?: number, limit?: number): Promise<import("@qa-app/database").PaginatedResult<any>>;
    getMyActivityStats(userId: string, days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getAuditLogs(page?: number, limit?: number, actorId?: string, actorType?: string, action?: string, resourceType?: string, resourceId?: string, startDate?: string, endDate?: string): Promise<import("@qa-app/database").PaginatedResult<any>>;
    getUserAuditLogs(userId: string, page?: number, limit?: number): Promise<import("@qa-app/database").PaginatedResult<any>>;
    getUserActivityStats(userId: string, days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    getResourceAuditLogs(resourceType: string, resourceId: string, page?: number, limit?: number): Promise<import("@qa-app/database").PaginatedResult<any>>;
    getActionStats(startDate?: string, endDate?: string): Promise<Record<string, number>>;
    detectUserAnomalousActivity(userId: string, timeWindowHours?: number): Promise<{
        isAnomalous: boolean;
        activityCount: number;
        threshold: number;
        actions: string[];
    }>;
    exportLogs(format?: 'json' | 'csv', startDate?: string, endDate?: string, actorId?: string, resourceType?: string): Promise<any>;
}
