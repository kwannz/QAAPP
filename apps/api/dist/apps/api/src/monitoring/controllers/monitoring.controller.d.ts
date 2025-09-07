import { Response } from 'express';
import { MetricsService } from '../../common/metrics/metrics.service';
import { MonitoringService } from '../services/monitoring.service';
import { GetMetricsDto, CreateAlertDto, ResolveAlertDto, ExportDataDto } from '../dto';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly metricsService;
    constructor(monitoringService: MonitoringService, metricsService: MetricsService);
    getMetrics(query: GetMetricsDto): Promise<import("../interfaces/monitoring.interface").MonitoringMetrics>;
    getDashboard(timeRange?: '1h' | '24h' | '7d' | '30d'): Promise<import("../interfaces/monitoring.interface").MonitoringMetrics>;
    getDeprecationStats(): Promise<{
        timestamp: Date;
        items: {
            path: string;
            count: number;
        }[];
    }>;
    getLogs(query: GetMetricsDto, headers: Record<string, string>, res: Response): Promise<{
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
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAuditLogs(query: GetMetricsDto, headers: Record<string, string>, res: Response): Promise<{
        logs: {
            id: string;
            action: string;
            actorId: string | null;
            resourceType: string | null;
            resourceId: string | null;
            details: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            actor: {
                email: string | null;
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
            } | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAlerts(query: GetMetricsDto, headers: Record<string, string>, res: Response): Promise<{
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
            metadata: import("@prisma/client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPerformanceData(query: GetMetricsDto, headers: Record<string, string>, res: Response): Promise<{
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
    createAlert(createAlertDto: CreateAlertDto): Promise<{
        id: string;
        title: string;
        message: string;
        severity: string;
        module: string;
        category: string | null;
        status: string;
        createdAt: Date;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    resolveAlert(id: string, resolveAlertDto: ResolveAlertDto): Promise<{
        id: string;
        status: string;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    exportData(exportDto: ExportDataDto, res: Response): Promise<void>;
    healthCheck(): Promise<{
        status: "error" | "healthy" | "warning";
        timestamp: string;
        uptime: number;
        issues: string[];
    }>;
    getRealtimeMetrics(res: Response): Promise<void>;
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
    getQueryOptimizationStats(query: GetMetricsDto): Promise<{
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
}
