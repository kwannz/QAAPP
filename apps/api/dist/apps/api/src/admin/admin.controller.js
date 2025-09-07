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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
let AdminController = class AdminController {
    constructor() { }
    async getUserAuditRecords(userId) {
        const mockUserAudits = [
            {
                id: 'audit-001',
                userId: 'user-001',
                userName: '张小明',
                userEmail: 'zhang@example.com',
                riskLevel: 'medium',
                riskScore: 65,
                behaviorPattern: 'frequent_large_withdrawals',
                suspicious: true,
                lastActivity: new Date('2024-01-27T14:30:00Z'),
                kycStatus: 'approved',
                accountAge: 45,
                totalTransactionVolume: 125000,
                flags: ['large_withdrawals', 'new_device_login'],
                createdAt: new Date('2024-01-27T10:00:00Z')
            }
        ];
        return {
            audits: userId ? mockUserAudits.filter(a => a.userId === userId) : mockUserAudits,
            total: mockUserAudits.length
        };
    }
    async getSystemAuditEvents(type) {
        const mockSystemEvents = [
            {
                id: 'sys-001',
                type: 'performance_degradation',
                severity: 'high',
                title: 'API响应时间异常',
                description: '用户认证API平均响应时间超过2秒',
                affectedServices: ['auth-service', 'user-service'],
                startTime: new Date('2024-01-27T13:45:00Z'),
                endTime: null,
                status: 'investigating',
                impact: 'high',
                metadata: {
                    avgResponseTime: 2.3,
                    threshold: 1.0,
                    affectedRequests: 1250
                }
            }
        ];
        return {
            events: type ? mockSystemEvents.filter(e => e.type === type) : mockSystemEvents,
            total: mockSystemEvents.length
        };
    }
    async getSystemMetrics() {
        return {
            performance: {
                cpuUsage: 45.2,
                memoryUsage: 68.7,
                diskUsage: 34.1,
                networkIO: 125.6
            },
            availability: {
                uptime: 99.94,
                downtime: '2.4小时',
                mttr: '15分钟',
                mtbf: '720小时'
            },
            security: {
                activeThreats: 0,
                blockedIPs: 45,
                failedLogins: 12,
                suspiciousActivities: 3
            },
            database: {
                connectionPool: 78,
                queryTime: 45.2,
                lockWaitTime: 2.1,
                deadlocks: 0
            }
        };
    }
    async getPermissions() {
        const mockPermissions = [
            {
                id: 'perm-001',
                name: 'user.read',
                description: '查看用户信息',
                module: 'user-management',
                type: 'read',
                createdAt: new Date('2024-01-01T00:00:00Z')
            },
            {
                id: 'perm-002',
                name: 'user.write',
                description: '编辑用户信息',
                module: 'user-management',
                type: 'write',
                createdAt: new Date('2024-01-01T00:00:00Z')
            }
        ];
        return { permissions: mockPermissions, total: mockPermissions.length };
    }
    async getRoles() {
        const mockRoles = [
            {
                id: 'role-001',
                name: 'admin',
                description: '系统管理员',
                permissions: ['user.read', 'user.write', 'admin.read', 'admin.write'],
                userCount: 3,
                createdAt: new Date('2024-01-01T00:00:00Z')
            }
        ];
        return { roles: mockRoles, total: mockRoles.length };
    }
    async getUserRoles() {
        const mockUserRoles = [
            {
                id: 'ur-001',
                userId: 'user-001',
                userName: '张小明',
                userEmail: 'zhang@example.com',
                roleId: 'role-001',
                roleName: 'admin',
                assignedAt: new Date('2024-01-01T00:00:00Z'),
                assignedBy: 'admin-001',
                status: 'active'
            }
        ];
        return { userRoles: mockUserRoles, total: mockUserRoles.length };
    }
    async getPerformanceMetrics() {
        const mockMetrics = [
            {
                id: 'perf-001',
                name: 'API响应时间',
                category: 'performance',
                value: 245.6,
                unit: 'ms',
                target: 200,
                status: 'warning',
                trend: 'increasing',
                timestamp: new Date('2024-01-27T14:00:00Z'),
                metadata: {
                    p50: 180,
                    p90: 350,
                    p99: 580
                }
            }
        ];
        return { metrics: mockMetrics, total: mockMetrics.length };
    }
    async getPerformanceTests() {
        const mockTests = [
            {
                id: 'test-001',
                name: '用户登录压力测试',
                type: 'load_test',
                status: 'completed',
                duration: 300,
                virtualUsers: 1000,
                requestCount: 15000,
                errorRate: 0.02,
                avgResponseTime: 234.5,
                throughput: 50.2,
                startTime: new Date('2024-01-27T10:00:00Z'),
                endTime: new Date('2024-01-27T10:05:00Z')
            }
        ];
        return { tests: mockTests, total: mockTests.length };
    }
    async getComplianceStandards() {
        const mockStandards = [
            {
                id: 'std-001',
                name: 'GDPR合规',
                category: 'privacy',
                description: '欧盟通用数据保护条例合规要求',
                requirements: [
                    '用户数据收集透明化',
                    '数据处理合法性基础',
                    '用户权利保障机制'
                ],
                complianceLevel: 85.5,
                status: 'compliant',
                lastAssessment: new Date('2024-01-15T00:00:00Z'),
                nextReview: new Date('2024-04-15T00:00:00Z')
            }
        ];
        return { standards: mockStandards, total: mockStandards.length };
    }
    async getComplianceChecks() {
        const mockChecks = [
            {
                id: 'check-001',
                standardId: 'std-001',
                name: '数据加密检查',
                type: 'automated',
                frequency: 'daily',
                lastRun: new Date('2024-01-27T02:00:00Z'),
                nextRun: new Date('2024-01-28T02:00:00Z'),
                status: 'passed',
                result: {
                    score: 95,
                    issues: [],
                    recommendations: []
                }
            }
        ];
        return { checks: mockChecks, total: mockChecks.length };
    }
    async getBusinessKPIs() {
        const mockKPIs = [
            {
                id: 'kpi-001',
                name: '月活跃用户',
                category: 'user',
                value: 15420,
                target: 18000,
                unit: 'users',
                trend: 'increasing',
                change: 8.5,
                status: 'on_track',
                period: 'monthly',
                timestamp: new Date('2024-01-27T00:00:00Z')
            }
        ];
        return { kpis: mockKPIs, total: mockKPIs.length };
    }
    async getBusinessHealth() {
        return {
            overallScore: 78.5,
            categories: {
                financial: { score: 85, status: 'good' },
                operational: { score: 75, status: 'warning' },
                customer: { score: 80, status: 'good' },
                technology: { score: 72, status: 'warning' }
            },
            trends: {
                revenue: { value: 125000, change: 12.3, trend: 'up' },
                users: { value: 15420, change: 8.5, trend: 'up' },
                satisfaction: { value: 4.2, change: -2.1, trend: 'down' }
            },
            alerts: [
                {
                    id: 'alert-001',
                    type: 'warning',
                    message: '客户投诉率上升',
                    severity: 'medium',
                    timestamp: new Date('2024-01-27T12:00:00Z')
                }
            ]
        };
    }
    async createAlertRule(ruleData) {
        return {
            id: `rule-${Date.now()}`,
            ...ruleData,
            createdAt: new Date(),
            status: 'active'
        };
    }
    async getAlertRules() {
        const mockRules = [
            {
                id: 'rule-001',
                name: '登录失败告警',
                condition: '登录失败次数 > 5',
                threshold: 5,
                action: 'email_notification',
                status: 'active',
                createdAt: new Date('2024-01-20T00:00:00Z')
            }
        ];
        return { rules: mockRules, total: mockRules.length };
    }
    async executeDataCleanup(cleanupConfig) {
        return {
            taskId: `cleanup-${Date.now()}`,
            status: 'submitted',
            config: cleanupConfig,
            estimatedDuration: '30分钟',
            submittedAt: new Date()
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('user-audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user audit records' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserAuditRecords", null);
__decorate([
    (0, common_1.Get)('system-audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system audit events' }),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemAuditEvents", null);
__decorate([
    (0, common_1.Get)('system-audit/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get permissions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get roles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('user-roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user role assignments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserRoles", null);
__decorate([
    (0, common_1.Get)('performance/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('performance/tests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance tests' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPerformanceTests", null);
__decorate([
    (0, common_1.Get)('compliance/standards'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance standards' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getComplianceStandards", null);
__decorate([
    (0, common_1.Get)('compliance/checks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance checks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getComplianceChecks", null);
__decorate([
    (0, common_1.Get)('business/kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business KPIs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBusinessKPIs", null);
__decorate([
    (0, common_1.Get)('business/health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business health metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBusinessHealth", null);
__decorate([
    (0, common_1.Post)('alert-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Create alert rule' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAlertRule", null);
__decorate([
    (0, common_1.Get)('alert-rules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert rules' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAlertRules", null);
__decorate([
    (0, common_1.Post)('data-cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute data cleanup' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "executeDataCleanup", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, auth_decorator_1.Auth)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [])
], AdminController);
//# sourceMappingURL=admin.controller.js.map