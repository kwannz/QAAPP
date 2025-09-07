import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare enum LogLevel {
    VERBOSE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    CRITICAL = 5
}
export interface DatabaseOperation {
    operation: string;
    table: string;
    query?: string;
    parameters?: any[];
    executionTime: number;
    rowsAffected?: number;
    success: boolean;
    error?: string;
}
export interface ApiRequestInfo {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    userId?: string;
    ip?: string;
    userAgent?: string;
    responseStatus?: number;
    responseTime?: number;
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    module: string;
    message: string;
    data?: any;
    requestId?: string;
    userId?: string;
    sessionId: string;
    performanceMetrics?: {
        cpuUsage?: number;
        memoryUsage?: number;
        heapUsed?: number;
        heapTotal?: number;
        external?: number;
        arrayBuffers?: number;
    };
    databaseMetrics?: DatabaseOperation;
    apiMetrics?: ApiRequestInfo;
}
export declare class VerboseLoggerService implements LoggerService {
    private configService;
    private logLevel;
    private enableFileOutput;
    private enableDatabaseLogging;
    private logDirectory;
    private sessionId;
    private performanceTracker;
    constructor(configService: ConfigService);
    private getLogLevelFromConfig;
    private generateSessionId;
    private ensureLogDirectory;
    private shouldLog;
    private formatLogEntry;
    private getConsoleColor;
    private getPerformanceMetrics;
    private writeToFile;
    private createLogEntry;
    private processLogEntry;
    verbose(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    debug(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    info(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    warn(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    error(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    critical(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void>;
    log(message: string, context?: string): void;
    startTiming(operation: string): void;
    endTiming(operation: string, module?: string, data?: any): Promise<number>;
    trackDatabaseOperation(operation: string, table: string, query?: string, parameters?: any[], executionTime?: number, rowsAffected?: number, error?: Error): Promise<void>;
    trackApiRequest(apiInfo: ApiRequestInfo): Promise<void>;
    trackTransaction(transactionId: string, operation: string, startTime: number, success: boolean, error?: Error): Promise<void>;
    trackUserAction(userId: string, action: string, resource: string, data?: any): Promise<void>;
    logSystemHealth(): Promise<void>;
    getSystemStats(): any;
    trackError(error: Error, module: string, context?: any, requestId?: string, userId?: string): Promise<void>;
}
