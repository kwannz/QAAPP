"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ResponseInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ResponseInterceptor = ResponseInterceptor_1 = class ResponseInterceptor {
    constructor() {
        this.logger = new common_1.Logger(ResponseInterceptor_1.name);
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const requestId = ((Array.isArray(request.headers['x-request-id'])
            ? request.headers['x-request-id'][0]
            : request.headers['x-request-id']) ||
            (Array.isArray(request.headers['x-correlation-id'])
                ? request.headers['x-correlation-id'][0]
                : request.headers['x-correlation-id']) ||
            this.generateRequestId());
        response.setHeader('X-Request-ID', requestId);
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.map)((data) => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logRequest(request, response, duration, requestId);
            if (this.isSpecialResponse(data)) {
                return data;
            }
            const apiResponse = {
                success: true,
                data: data,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId,
                    version: process.env.API_VERSION || '1.0.0',
                },
            };
            if (data && typeof data === 'object' && 'pagination' in data) {
                apiResponse.pagination = data.pagination;
                apiResponse.data = data.data || data.items;
            }
            if (data && typeof data === 'object' && 'message' in data) {
                apiResponse.message = data.message;
            }
            return apiResponse;
        }));
    }
    isSpecialResponse(data) {
        if (data && typeof data === 'object' && 'success' in data) {
            return true;
        }
        if (data instanceof Buffer || data instanceof Uint8Array) {
            return true;
        }
        return false;
    }
    logRequest(request, response, duration, requestId) {
        const logData = {
            requestId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            contentLength: response.get('content-length'),
        };
        if (duration > 1000) {
            this.logger.warn(`Slow request detected: ${request.method} ${request.url}`, JSON.stringify(logData, null, 2));
        }
        else {
            this.logger.log(`${request.method} ${request.url} - ${response.statusCode} - ${duration}ms`, 'RequestLog');
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = ResponseInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
//# sourceMappingURL=response.interceptor.js.map