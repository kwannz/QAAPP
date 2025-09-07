export interface SimpleMetric {
    name: string;
    value: number;
    timestamp: Date;
    labels?: Record<string, string>;
}
export declare class MetricsService {
    private readonly logger;
    private metrics;
    private requests;
    private errors;
    private deprecations;
    constructor();
    recordRequest(method: string, path: string, statusCode: number, duration: number): void;
    recordBusinessMetric(name: string, value: number, category: string): void;
    private setMetric;
    getSystemStatus(): {
        totalRequests: number;
        totalErrors: number;
        errorRate: number;
        uptime: string;
        timestamp: Date;
    };
    getAllMetrics(): SimpleMetric[];
    recordDeprecation(path: string): void;
    getDeprecationStats(): {
        path: string;
        count: number;
    }[];
    private buildKey;
    private formatUptime;
}
