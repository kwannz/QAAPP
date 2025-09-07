"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const winston_config_1 = require("../logger/winston.config");
const error_utils_1 = require("../utils/error.utils");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const requestId = this.generateRequestId();
        const userAgent = request.headers['user-agent'] || '';
        const ipAddress = this.extractIpAddress(request);
        const userId = request.user?.id;
        response.setHeader('X-Request-ID', requestId);
        const startLog = {
            message: `Incoming ${request.method} ${request.url}`,
            context: winston_config_1.LogContext.API,
            requestId,
            endpoint: request.url,
            method: request.method,
            userId,
            userAgent,
            ipAddress,
            metadata: {
                query: request.query,
                params: request.params,
                bodySize: request.headers['content-length'] || 0
            }
        };
        this.logStructured('info', startLog);
        return next.handle().pipe((0, operators_1.tap)((data) => {
            const responseTime = Date.now() - startTime;
            const successLog = {
                message: `${request.method} ${request.url} - ${response.statusCode}`,
                context: winston_config_1.LogContext.API,
                requestId,
                endpoint: request.url,
                method: request.method,
                responseTime,
                statusCode: response.statusCode,
                userId,
                userAgent,
                ipAddress,
                operation: 'http_request',
                duration: responseTime,
                metadata: {
                    responseSize: JSON.stringify(data || {}).length,
                    success: true
                }
            };
            if (responseTime > 2000) {
                this.logStructured('warn', {
                    ...successLog,
                    message: `🐌 Slow response: ${request.method} ${request.url} took ${responseTime}ms`
                });
            }
            else {
                this.logStructured('info', successLog);
            }
        }), (0, operators_1.catchError)((error) => {
            const responseTime = Date.now() - startTime;
            const errorLog = {
                message: `❌ ${request.method} ${request.url} - ${error.status || 500}`,
                context: winston_config_1.LogContext.API,
                requestId,
                endpoint: request.url,
                method: request.method,
                responseTime,
                statusCode: error.status || 500,
                userId,
                userAgent,
                ipAddress,
                metadata: {
                    error: (0, error_utils_1.getErrorMessage)(error),
                    stack: (0, error_utils_1.getErrorStack)(error),
                    success: false
                }
            };
            this.logStructured('error', errorLog);
            throw error;
        }));
    }
    logStructured(level, log) {
        const logMessage = {
            ...log,
            timestamp: new Date().toISOString(),
            service: 'qa-app-api'
        };
        switch (level) {
            case 'error':
                this.logger.error(logMessage);
                break;
            case 'warn':
                this.logger.warn(logMessage);
                break;
            case 'debug':
                this.logger.debug(logMessage);
                break;
            default:
                this.logger.log(logMessage);
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    extractIpAddress(request) {
        return (request.headers['cf-connecting-ip'] ||
            request.headers['x-real-ip'] ||
            request.headers['x-forwarded-for']?.split(',')[0] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket?.remoteAddress ||
            'unknown').replace(/^::ffff:/, '');
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map