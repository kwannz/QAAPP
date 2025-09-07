import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
export interface LoggingConfig {
    level: string;
    format: winston.Logform.Format;
    transports: winston.transport[];
    defaultMeta: Record<string, any>;
}
export declare const createLoggingConfig: (configService: ConfigService) => LoggingConfig;
export declare const LOG_LEVELS: {
    error: number;
    warn: number;
    info: number;
    http: number;
    verbose: number;
    debug: number;
    silly: number;
};
export declare const SENSITIVE_FIELDS: string[];
export interface LogContext {
    requestId?: string;
    userId?: string;
    sessionId?: string;
    operation?: string;
    module?: string;
    component?: string;
    duration?: number;
    status?: 'success' | 'failure' | 'pending';
    timestamp?: string;
    metadata?: Record<string, any>;
}
export declare const enhanceLogContext: (baseContext: LogContext, additionalContext?: Record<string, any>) => LogContext;
