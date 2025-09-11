export declare class GetMetricsDto {
    startDate?: string;
    endDate?: string;
    level?: 'error' | 'warn' | 'info' | 'debug';
    module?: string;
    userId?: string;
    q?: string;
    limit?: number;
    offset?: number;
}
export declare class CreateAlertDto {
    title: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    module: string;
    metadata?: any;
}
export declare class ResolveAlertDto {
    resolution: string;
}
export declare class ExportDataDto {
    startDate?: string;
    endDate?: string;
    level?: 'error' | 'warn' | 'info' | 'debug';
    module?: string;
    format: 'csv' | 'json' | 'excel';
    resource?: 'all' | 'logs';
    q?: string;
}
