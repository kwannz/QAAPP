"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = ((Array.isArray(request.headers['x-request-id'])
            ? request.headers['x-request-id'][0]
            : request.headers['x-request-id']) ||
            (Array.isArray(request.headers['x-correlation-id'])
                ? request.headers['x-correlation-id'][0]
                : request.headers['x-correlation-id']) ||
            this.generateRequestId());
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_SERVER_ERROR';
        let message = 'Internal server error';
        let details = null;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                code = this.getErrorCode(status);
            }
            else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse;
                message = responseObj.message || responseObj.error || message;
                code = responseObj.code || this.getErrorCode(status);
                details = responseObj.details;
            }
        }
        else if (exception instanceof throttler_1.ThrottlerException) {
            status = common_1.HttpStatus.TOO_MANY_REQUESTS;
            code = 'RATE_LIMIT_EXCEEDED';
            message = 'Too many requests, please try again later';
        }
        else if (exception instanceof Error) {
            message = exception.message;
            code = 'APPLICATION_ERROR';
            if (exception.message.includes('ECONNREFUSED')) {
                code = 'DATABASE_CONNECTION_ERROR';
                message = 'Database connection failed';
            }
            else if (exception.message.includes('duplicate key')) {
                status = common_1.HttpStatus.CONFLICT;
                code = 'DUPLICATE_RESOURCE';
                message = 'Resource already exists';
            }
            else if (exception.message.includes('not found')) {
                status = common_1.HttpStatus.NOT_FOUND;
                code = 'RESOURCE_NOT_FOUND';
                message = 'Requested resource not found';
            }
        }
        const errorResponse = {
            success: false,
            error: {
                code,
                message,
                details,
                timestamp: new Date().toISOString(),
                path: request.url,
                requestId,
            },
        };
        this.logError(exception, request, status, requestId);
        response
            .status(status)
            .header('X-Request-ID', requestId)
            .json(errorResponse);
    }
    getErrorCode(status) {
        const statusCodeMap = {
            [common_1.HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
            [common_1.HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
            [common_1.HttpStatus.FORBIDDEN]: 'FORBIDDEN',
            [common_1.HttpStatus.NOT_FOUND]: 'NOT_FOUND',
            [common_1.HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
            [common_1.HttpStatus.CONFLICT]: 'CONFLICT',
            [common_1.HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
            [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
            [common_1.HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
            [common_1.HttpStatus.BAD_GATEWAY]: 'BAD_GATEWAY',
            [common_1.HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
            [common_1.HttpStatus.GATEWAY_TIMEOUT]: 'GATEWAY_TIMEOUT',
        };
        return statusCodeMap[status] || 'UNKNOWN_ERROR';
    }
    logError(exception, request, status, requestId) {
        const message = exception instanceof Error ? exception.message : 'Unknown error';
        const stack = exception instanceof Error ? exception.stack : '';
        const logContext = {
            requestId,
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            status,
            message,
        };
        if (status >= 500) {
            this.logger.error(`Server Error: ${message}`, stack, JSON.stringify(logContext, null, 2));
        }
        else if (status >= 400) {
            this.logger.warn(`Client Error: ${message}`, JSON.stringify(logContext, null, 2));
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map