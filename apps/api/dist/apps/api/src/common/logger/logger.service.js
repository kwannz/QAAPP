"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston = __importStar(require("winston"));
let DailyRotateFile;
try {
    DailyRotateFile = require('winston-daily-rotate-file');
}
catch (error) {
    console.warn('winston-daily-rotate-file not found, using file transport instead');
}
let LoggerService = class LoggerService {
    constructor() {
        this.initializeLoggers();
    }
    initializeLoggers() {
        const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json(), winston.format.prettyPrint());
        const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss.SSS' }), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `[${timestamp}] ${level} [${context || 'App'}]: ${message}${metaStr}`;
        }));
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { service: 'qa-app-api' },
            transports: [
                new winston.transports.Console({
                    format: consoleFormat,
                }),
                ...(DailyRotateFile ? [
                    new DailyRotateFile({
                        filename: 'logs/app-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '20m',
                        maxFiles: '14d',
                    })
                ] : [
                    new winston.transports.File({
                        filename: 'logs/app.log',
                        maxsize: 20 * 1024 * 1024,
                    })
                ]),
            ],
        });
        this.requestLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'api-requests' },
            transports: [
                ...(DailyRotateFile ? [
                    new DailyRotateFile({
                        filename: 'logs/requests-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '50m',
                        maxFiles: '30d',
                    })
                ] : [
                    new winston.transports.File({
                        filename: 'logs/requests.log',
                        maxsize: 50 * 1024 * 1024,
                    })
                ]),
            ],
        });
        this.performanceLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'performance' },
            transports: [
                ...(DailyRotateFile ? [
                    new DailyRotateFile({
                        filename: 'logs/performance-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '20m',
                        maxFiles: '7d',
                    })
                ] : [
                    new winston.transports.File({
                        filename: 'logs/performance.log',
                        maxsize: 20 * 1024 * 1024,
                    })
                ]),
            ],
        });
        this.auditLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'audit' },
            transports: [
                ...(DailyRotateFile ? [
                    new DailyRotateFile({
                        filename: 'logs/audit-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '50m',
                        maxFiles: '90d',
                    })
                ] : [
                    new winston.transports.File({
                        filename: 'logs/audit.log',
                        maxsize: 50 * 1024 * 1024,
                    })
                ]),
            ],
        });
        this.errorLogger = winston.createLogger({
            level: 'error',
            format: logFormat,
            defaultMeta: { service: 'errors' },
            transports: [
                new winston.transports.Console({
                    format: consoleFormat,
                }),
                ...(DailyRotateFile ? [
                    new DailyRotateFile({
                        filename: 'logs/errors-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        maxSize: '20m',
                        maxFiles: '30d',
                    })
                ] : [
                    new winston.transports.File({
                        filename: 'logs/errors.log',
                        maxsize: 20 * 1024 * 1024,
                    })
                ]),
            ],
        });
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.errorLogger.error(message, { trace, context });
        this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
    logRequest(request, response, duration) {
        const log = {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            path: request.path,
            query: request.query,
            body: this.sanitizeBody(request.body),
            headers: this.sanitizeHeaders(request.headers),
            ip: request.ip,
            userAgent: request.get('user-agent'),
            userId: request.user?.id,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            responseSize: response.get ? response.get('content-length') : undefined,
        };
        this.requestLogger.info('API Request', log);
        if (duration > 1000) {
            this.performanceLogger.warn('Slow API Request', {
                ...log,
                warning: 'Request took longer than 1 second',
            });
        }
    }
    logPerformance(operation, duration, metadata) {
        const log = {
            operation,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...metadata,
        };
        this.performanceLogger.info('Performance Metric', log);
        if (duration > 3000) {
            this.performanceLogger.warn('Performance Warning', {
                ...log,
                warning: 'Operation took longer than 3 seconds',
            });
        }
    }
    logAudit(userId, action, resource, details) {
        const log = {
            userId,
            action,
            resource,
            timestamp: new Date().toISOString(),
            details: this.sanitizeData(details),
        };
        this.auditLogger.info('Audit Event', log);
    }
    logSecurity(event, userId, details) {
        const log = {
            event,
            userId,
            timestamp: new Date().toISOString(),
            severity: this.getSecuritySeverity(event),
            details: this.sanitizeData(details),
        };
        this.auditLogger.warn('Security Event', log);
    }
    logBusiness(event, metadata) {
        this.logger.info(`Business Event: ${event}`, {
            context: 'Business',
            ...metadata,
        });
    }
    logQuery(query, parameters, duration) {
        const log = {
            query: this.sanitizeQuery(query),
            parameters: parameters?.map(p => this.sanitizeData(p)),
            duration: duration ? `${duration}ms` : undefined,
            timestamp: new Date().toISOString(),
        };
        if (duration && duration > 100) {
            this.performanceLogger.warn('Slow Database Query', log);
        }
        else {
            this.logger.debug('Database Query', { context: 'Database', ...log });
        }
    }
    logCache(operation, key, hit, duration) {
        this.logger.debug(`Cache ${operation}`, {
            context: 'Cache',
            key,
            hit,
            duration: duration ? `${duration}ms` : undefined,
        });
    }
    logQueue(queue, operation, message, status, error) {
        const log = {
            queue,
            operation,
            message: this.sanitizeData(message),
            status,
            error: error?.message || error,
            timestamp: new Date().toISOString(),
        };
        if (status === 'failure') {
            this.errorLogger.error('Queue Operation Failed', log);
        }
        else {
            this.logger.info('Queue Operation', { context: 'Queue', ...log });
        }
    }
    logExternalCall(service, method, url, duration, status, error) {
        const log = {
            service,
            method,
            url,
            duration: `${duration}ms`,
            status,
            error: error?.message || error,
            timestamp: new Date().toISOString(),
        };
        if (error || status >= 400) {
            this.errorLogger.error('External Service Call Failed', log);
        }
        else if (duration > 2000) {
            this.performanceLogger.warn('Slow External Service Call', log);
        }
        else {
            this.logger.info('External Service Call', { context: 'External', ...log });
        }
    }
    logWebSocket(event, clientId, data) {
        this.logger.info(`WebSocket ${event}`, {
            context: 'WebSocket',
            clientId,
            data: this.sanitizeData(data),
            timestamp: new Date().toISOString(),
        });
    }
    async getLogStats() {
        return {
            totalLogs: 0,
            errorCount: 0,
            warnCount: 0,
            slowRequests: 0,
            auditEvents: 0,
        };
    }
    sanitizeData(data) {
        if (!data)
            return data;
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
        if (typeof data === 'string') {
            return data;
        }
        if (typeof data === 'object') {
            const sanitized = { ...data };
            for (const field of sensitiveFields) {
                if (sanitized[field]) {
                    sanitized[field] = '***REDACTED***';
                }
            }
            return sanitized;
        }
        return data;
    }
    sanitizeBody(body) {
        if (!body)
            return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'refreshToken'];
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        }
        return sanitized;
    }
    sanitizeHeaders(headers) {
        if (!headers)
            return headers;
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        for (const header of sensitiveHeaders) {
            if (sanitized[header]) {
                sanitized[header] = '***REDACTED***';
            }
        }
        return sanitized;
    }
    sanitizeQuery(query) {
        return query.replace(/password\s*=\s*'[^']*'/gi, "password='***REDACTED***'");
    }
    getSecuritySeverity(event) {
        const criticalEvents = ['UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'INJECTION_ATTEMPT'];
        const highEvents = ['LOGIN_FAILURE_MULTIPLE', 'PERMISSION_VIOLATION', 'SUSPICIOUS_ACTIVITY'];
        const mediumEvents = ['LOGIN_FAILURE', 'INVALID_TOKEN', 'RATE_LIMIT_EXCEEDED'];
        if (criticalEvents.includes(event))
            return 'critical';
        if (highEvents.includes(event))
            return 'high';
        if (mediumEvents.includes(event))
            return 'medium';
        return 'low';
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
//# sourceMappingURL=logger.service.js.map