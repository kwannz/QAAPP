import { ConfigService } from '@nestjs/config';
import { Prisma } from '@qa-app/database';
import { DatabaseService } from '../../database/database.service';
import { PerformanceOptimizerService } from '../../common/performance/performance-optimizer.service';
import { OptimizedQueriesService } from '../../common/database/optimized-queries.service';
import { MonitoringMetrics, MonitoringQuery } from '../interfaces/monitoring.interface';
export { MonitoringQuery };
export declare class MonitoringService {
    private configService;
    private database;
    private performanceOptimizer;
    private optimizedQueries;
    private readonly logger;
    constructor(configService: ConfigService, database: DatabaseService, performanceOptimizer: PerformanceOptimizerService, optimizedQueries: OptimizedQueriesService);
    ingestClientLog(payload: any, meta?: {
        userAgent?: string;
        ip?: string;
    }): Promise<void>;
    getMetrics(query?: MonitoringQuery): Promise<MonitoringMetrics>;
    private getLogsMetrics;
    private getAuditMetrics;
    private getAlertsMetrics;
    private getPerformanceMetrics;
    private getSystemStatus;
    private checkDatabaseHealth;
    private checkRedisHealth;
    private checkExternalServices;
    getLogs(query: MonitoringQuery): Promise<{
        logs: {
            id: string;
            level: string;
            message: string;
            module: string | null;
            timestamp: Date;
            userId: string | null;
            user: {
                email: string | null;
                id: string;
                role: import("@qa-app/database").$Enums.UserRole;
            } | null;
            metadata: Prisma.JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAuditLogs(query: MonitoringQuery): Promise<{
        logs: {
            id: string;
            action: string;
            actorId: string | null;
            resourceType: string | null;
            resourceId: string | null;
            details: Prisma.JsonValue;
            createdAt: Date;
            actor: {
                email: string | null;
                id: string;
                role: import("@qa-app/database").$Enums.UserRole;
            } | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAlerts(query: MonitoringQuery): Promise<{
        data: {
            id: string;
            title: string;
            message: string;
            status: string;
            severity: string;
            module: string;
            category: string | null;
            createdAt: Date;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolution: string | null;
            metadata: Prisma.JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPerformanceData(query: MonitoringQuery): Promise<{
        responseTimes: {
            average: number;
            min: number;
            max: number;
        };
        uptime: number;
        throughput: number;
        errorRate: number;
        cacheStats: {
            hitRate: number;
            memoryUsage: number;
        };
    } | {
        responseTimes: {
            average: number;
            min: number;
            max: number;
        };
        uptime: number;
        throughput: number;
        errorRate: number;
        cacheStats?: undefined;
    }>;
    createAlert(alertData: {
        title: string;
        message: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        module: string;
        category?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        title: string;
        message: string;
        severity: string;
        module: string;
        category: string | null;
        status: string;
        createdAt: Date;
        metadata: Prisma.JsonValue;
    }>;
    resolveAlert(alertId: string, resolution: string, resolvedBy?: string): Promise<{
        id: string;
        status: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    getDashboardData(timeRange?: '1h' | '24h' | '7d' | '30d'): Promise<MonitoringMetrics>;
    exportData(query: MonitoringQuery, format?: 'csv' | 'json' | 'excel', resource?: 'all' | 'logs'): Promise<string | Buffer<ArrayBufferLike>>;
    private generateLogsCSV;
    private generateLogsExcel;
    private generateCSV;
    private generateExcel;
    getPerformanceOptimizationReport(): Promise<{
        summary: any;
        recommendations: string[];
        metrics: import("../../common/performance/performance-optimizer.service").OptimizationMetrics;
        cacheStats: any;
        timestamp: string;
        status: string;
        error?: undefined;
    } | {
        summary: {};
        recommendations: never[];
        metrics: {};
        cacheStats: {};
        timestamp: string;
        status: string;
        error: string;
    }>;
    getQueryOptimizationStats(query: MonitoringQuery): Promise<{
        queryOptimizations: number;
        cacheHitRate: number;
        totalQueries: number;
        optimizedQueries: number;
        averageQueryTime: number;
        userStats: {
            totalUsers: number;
            activeUsers: number;
            inactiveUsers: number;
            usersByRole: Record<string, number>;
            usersByKyc: Record<string, number>;
            recentRegistrations: number;
            lastUpdated: Date;
        };
        transactionStats: {
            timeRange: "30d" | "7d" | "1h" | "24h";
            period: {
                startDate: Date;
                endDate: Date;
            };
            users: any;
            orders: any;
            withdrawals: any;
            audit: any;
            lastUpdated: Date;
        };
        timestamp: string;
        error?: undefined;
    } | {
        queryOptimizations: number;
        cacheHitRate: number;
        totalQueries: number;
        optimizedQueries: number;
        averageQueryTime: number;
        userStats: null;
        transactionStats: null;
        timestamp: string;
        error: string;
    }>;
    getCachePerformanceStats(): Promise<{
        hitRate: number;
        missRate: number;
        totalQueries: any;
        totalResponses: any;
        memoryUsage: {
            queryCache: any;
            responseCache: any;
            total: any;
        };
        performance: {
            averageHitTime: number;
            averageMissTime: number;
            efficiency: string;
        };
        recommendations: string[];
        timestamp: string;
        error?: undefined;
    } | {
        hitRate: number;
        missRate: number;
        totalQueries: number;
        totalResponses: number;
        memoryUsage: {
            queryCache: number;
            responseCache: number;
            total: number;
        };
        performance: {
            averageHitTime: number;
            averageMissTime: number;
            efficiency: string;
        };
        recommendations: never[];
        timestamp: string;
        error: string;
    }>;
    clearPerformanceCache(): Promise<{
        status: string;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        message: string;
        error: string;
        timestamp: string;
    }>;
    private estimateTotalQueries;
    private calculateSystemUptime;
    private estimateThroughput;
    private calculateErrorRate;
}
