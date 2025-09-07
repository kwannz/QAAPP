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
var MonitoringInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_service_1 = require("../metrics/metrics.service");
const error_utils_1 = require("../utils/error.utils");
let MonitoringInterceptor = MonitoringInterceptor_1 = class MonitoringInterceptor {
    constructor(metricsService) {
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(MonitoringInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
        response.setHeader('X-Request-ID', requestId);
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const duration = Date.now() - startTime;
                this.metricsService.recordRequest(request.method, request.path, response.statusCode, duration);
                const isDeprecated = response.getHeader('Deprecation');
                if (isDeprecated) {
                    this.metricsService.recordDeprecation(request.path);
                }
                this.logger.log(`${request.method} ${request.path} - ${response.statusCode} - ${duration}ms`);
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.metricsService.recordRequest(request.method, request.path, 500, duration);
                const isDeprecated = response.getHeader('Deprecation');
                if (isDeprecated) {
                    this.metricsService.recordDeprecation(request.path);
                }
                this.logger.error(`${request.method} ${request.path} - ERROR - ${duration}ms: ${(0, error_utils_1.getErrorMessage)(error)}`, (0, error_utils_1.getErrorStack)(error));
            },
        }));
    }
};
exports.MonitoringInterceptor = MonitoringInterceptor;
exports.MonitoringInterceptor = MonitoringInterceptor = MonitoringInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MonitoringInterceptor);
//# sourceMappingURL=monitoring.interceptor.js.map