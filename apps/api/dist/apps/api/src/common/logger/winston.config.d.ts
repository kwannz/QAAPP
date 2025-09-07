import { WinstonModuleOptions } from 'nest-winston';
import 'winston-daily-rotate-file';
export declare const createWinstonConfig: (isDevelopment?: boolean) => WinstonModuleOptions;
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    HTTP = "http",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export declare enum LogContext {
    AUTH = "Auth",
    ORDER = "Order",
    PAYMENT = "Payment",
    CACHE = "Cache",
    DATABASE = "Database",
    PERFORMANCE = "Performance",
    SECURITY = "Security",
    API = "API",
    WEBSOCKET = "WebSocket",
    BLOCKCHAIN = "Blockchain"
}
export interface StructuredLog {
    message: string;
    context?: string;
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    responseTime?: number;
    statusCode?: number;
    userAgent?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
}
export interface PerformanceLog extends StructuredLog {
    operation: string;
    duration: number;
    memoryUsage?: {
        before: NodeJS.MemoryUsage;
        after: NodeJS.MemoryUsage;
    };
    cacheHit?: boolean;
    queryCount?: number;
}
export interface SecurityLog extends StructuredLog {
    event: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: Record<string, any>;
}
