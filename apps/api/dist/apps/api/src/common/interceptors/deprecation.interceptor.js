"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DeprecationInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeprecationInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const deprecated_decorator_1 = require("../decorators/deprecated.decorator");
let DeprecationInterceptor = DeprecationInterceptor_1 = class DeprecationInterceptor {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(DeprecationInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const deprecationOptions = this.reflector.get(deprecated_decorator_1.DEPRECATION_KEY, context.getHandler());
        if (!deprecationOptions) {
            return next.handle();
        }
        response.setHeader('Deprecation', deprecationOptions.since);
        response.setHeader('X-Deprecated-Since', deprecationOptions.since);
        response.setHeader('X-Deprecated-Until', deprecationOptions.until);
        response.setHeader('X-Deprecated-Replacement', deprecationOptions.replacement);
        if (deprecationOptions.reason) {
            response.setHeader('X-Deprecated-Reason', deprecationOptions.reason);
        }
        return next.handle().pipe((0, operators_1.tap)(() => {
            this.logger.warn(`Deprecated API called: ${request.method} ${request.url}`, {
                deprecation: deprecationOptions,
                userAgent: request.get('User-Agent'),
                ip: request.ip,
                userId: request.user?.id,
                timestamp: new Date().toISOString(),
            });
            this.recordDeprecationMetric(request, deprecationOptions);
        }));
    }
    recordDeprecationMetric(request, options) {
        try {
            const metric = {
                type: 'api_deprecation_usage',
                endpoint: `${request.method} ${request.route?.path || request.url}`,
                since: options.since,
                replacement: options.replacement,
                timestamp: Date.now(),
                count: 1
            };
            this.logger.log('Deprecation metric recorded', metric);
        }
        catch (error) {
            this.logger.error('Failed to record deprecation metric', error);
        }
    }
};
exports.DeprecationInterceptor = DeprecationInterceptor;
exports.DeprecationInterceptor = DeprecationInterceptor = DeprecationInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], DeprecationInterceptor);
//# sourceMappingURL=deprecation.interceptor.js.map