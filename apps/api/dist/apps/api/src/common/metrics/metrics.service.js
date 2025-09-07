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
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = MetricsService_1 = class MetricsService {
    constructor() {
        this.logger = new common_1.Logger(MetricsService_1.name);
        this.metrics = new Map();
        this.requests = 0;
        this.errors = 0;
        this.deprecations = new Map();
        this.logger.log('Simple metrics service initialized');
    }
    recordRequest(method, path, statusCode, duration) {
        this.requests++;
        if (statusCode >= 400) {
            this.errors++;
        }
        this.setMetric('http_requests_total', this.requests, { method, path });
        this.setMetric('http_request_duration_ms', duration, { method, path });
    }
    recordBusinessMetric(name, value, category) {
        this.setMetric(name, value, { category });
    }
    setMetric(name, value, labels) {
        const key = this.buildKey(name, labels);
        this.metrics.set(key, {
            name,
            value,
            timestamp: new Date(),
            labels
        });
        if (this.metrics.size > 100) {
            const firstKey = this.metrics.keys().next().value;
            if (firstKey !== undefined) {
                this.metrics.delete(firstKey);
            }
        }
    }
    getSystemStatus() {
        const uptimeMs = process.uptime() * 1000;
        const errorRate = this.requests > 0 ? (this.errors / this.requests) * 100 : 0;
        return {
            totalRequests: this.requests,
            totalErrors: this.errors,
            errorRate: Math.round(errorRate * 100) / 100,
            uptime: this.formatUptime(uptimeMs),
            timestamp: new Date()
        };
    }
    getAllMetrics() {
        return Array.from(this.metrics.values())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    recordDeprecation(path) {
        const current = this.deprecations.get(path) || 0;
        this.deprecations.set(path, current + 1);
        this.setMetric('deprecated_endpoint_hit', current + 1, { path });
    }
    getDeprecationStats() {
        return Array.from(this.deprecations.entries())
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count);
    }
    buildKey(name, labels) {
        if (!labels)
            return name;
        const labelString = Object.entries(labels)
            .map(([k, v]) => `${k}=${v}`)
            .join(',');
        return `${name}{${labelString}}`;
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0)
            return `${days}d ${hours % 24}h`;
        if (hours > 0)
            return `${hours}h ${minutes % 60}m`;
        if (minutes > 0)
            return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map