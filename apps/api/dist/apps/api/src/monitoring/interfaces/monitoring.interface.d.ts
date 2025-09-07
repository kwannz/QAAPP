export interface MonitoringLogEntry {
    id: string;
    level: 'error' | 'warning' | 'info' | 'debug';
    message: string;
    timestamp: Date;
    context?: string;
    metadata?: Record<string, unknown>;
}
export interface MonitoringAuditEntry {
    id: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface MonitoringAlertEntry {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    status: 'active' | 'resolved' | 'investigating';
    timestamp: Date;
    resolvedAt?: Date;
    metadata?: Record<string, unknown>;
}
export interface MonitoringPerformanceEntry {
    id: string;
    metric: string;
    value: number;
    unit: string;
    timestamp: Date;
    context?: string;
    metadata?: Record<string, unknown>;
}
export interface MonitoringMetrics {
    logs: {
        total: number;
        errors: number;
        warnings: number;
        recentEntries: MonitoringLogEntry[];
    };
    audit: {
        total: number;
        todayEntries: number;
        criticalActions: number;
        recentEntries: MonitoringAuditEntry[];
    };
    alerts: {
        active: number;
        resolved: number;
        critical: number;
        recentAlerts: MonitoringAlertEntry[];
    };
    performance: {
        avgResponseTime: number;
        errorRate: number;
        uptime: number;
        metrics: MonitoringPerformanceEntry[];
        optimizer: {
            cacheHitRate: number;
            queryOptimizations: number;
            memoryUsage: number;
            recommendations: string[];
            healthStatus: string;
        };
        queries: {
            totalQueries: number;
            optimizedQueries: number;
            slowQueries: number;
            averageQueryTime: number;
        };
    };
    system: {
        status: 'healthy' | 'warning' | 'error';
        lastCheck: Date;
        issues: string[];
    };
}
export interface MonitoringQuery {
    startDate?: Date;
    endDate?: Date;
    level?: 'error' | 'warn' | 'info' | 'debug';
    module?: string;
    userId?: string;
    limit?: number;
    offset?: number;
}
