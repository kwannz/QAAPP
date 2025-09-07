import { MetricsService } from '../common/metrics/metrics.service';
export declare class HealthController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
        message: string;
    }>;
    getApiHealth(): {
        status: string;
        service: string;
        endpoints: string[];
        timestamp: string;
    };
    getDetailedHealth(): Promise<{
        timestamp: string;
        overall: string;
        system: {
            uptime: string;
            version: string;
            environment: string;
            requests: number;
            errors: number;
            errorRate: number;
        };
        services: {
            auth: string;
            database: string;
            cache: string;
        };
        error?: undefined;
    } | {
        timestamp: string;
        overall: string;
        error: string;
        system: {
            uptime: string;
            version: string;
            environment: string;
            requests?: undefined;
            errors?: undefined;
            errorRate?: undefined;
        };
        services?: undefined;
    }>;
    getMetrics(): Promise<{
        timestamp: string;
        system: {
            totalRequests: number;
            totalErrors: number;
            errorRate: number;
            uptime: string;
            timestamp: Date;
        };
        metrics: import("../common/metrics/metrics.service").SimpleMetric[];
        error?: undefined;
    } | {
        timestamp: string;
        error: string;
        system?: undefined;
        metrics?: undefined;
    }>;
}
