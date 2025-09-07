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
exports.RiskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const risk_engine_service_1 = require("./risk-engine.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
let RiskController = class RiskController {
    constructor(riskEngineService) {
        this.riskEngineService = riskEngineService;
    }
    async performRiskAssessment(input) {
        return this.riskEngineService.performComprehensiveRiskAssessment(input);
    }
    async getRiskItems(category) {
        const mockRiskItems = [
            {
                id: 'risk-001',
                title: '大额提现风险',
                description: '用户申请提现金额超过平均值5倍',
                category: 'financial',
                severity: 'high',
                status: 'active',
                affectedUsers: 12,
                potentialLoss: 250000,
                probability: 0.75,
                impact: 0.85,
                riskScore: 63.75,
                createdAt: new Date('2024-01-27T10:00:00Z'),
                updatedAt: new Date('2024-01-27T14:30:00Z'),
                assignedTo: 'admin-001',
                mitigationPlan: '加强大额提现审核流程',
                metadata: {
                    withdrawalThreshold: 50000,
                    averageAmount: 10000,
                    detectedCount: 12
                }
            },
            {
                id: 'risk-002',
                title: 'KYC过期用户活跃度异常',
                description: '多个KYC过期用户近期交易活跃',
                category: 'compliance',
                severity: 'medium',
                status: 'monitoring',
                affectedUsers: 45,
                potentialLoss: 150000,
                probability: 0.60,
                impact: 0.55,
                riskScore: 33.0,
                createdAt: new Date('2024-01-26T15:20:00Z'),
                updatedAt: new Date('2024-01-27T12:00:00Z'),
                assignedTo: 'admin-002',
                mitigationPlan: '要求用户更新KYC认证',
                metadata: {
                    expiredUsers: 45,
                    averageActivity: 2.5,
                    threshold: 5.0
                }
            }
        ];
        return {
            items: category ? mockRiskItems.filter(item => item.category === category) : mockRiskItems,
            total: mockRiskItems.length,
            categories: ['financial', 'compliance', 'technical', 'operational']
        };
    }
    async getRiskTrends(period = '30d') {
        const mockTrends = {
            overview: {
                totalRisks: 28,
                highRisks: 8,
                mediumRisks: 12,
                lowRisks: 8,
                trendDirection: 'decreasing',
                changePercentage: -5.2
            },
            timeline: [
                { date: '2024-01-20', high: 10, medium: 15, low: 5 },
                { date: '2024-01-21', high: 9, medium: 14, low: 6 },
                { date: '2024-01-22', high: 11, medium: 13, low: 7 },
                { date: '2024-01-23', high: 8, medium: 16, low: 8 },
                { date: '2024-01-24', high: 7, medium: 14, low: 9 },
                { date: '2024-01-25', high: 9, medium: 12, low: 7 },
                { date: '2024-01-26', high: 8, medium: 13, low: 8 },
                { date: '2024-01-27', high: 8, medium: 12, low: 8 }
            ],
            categories: {
                financial: { current: 12, trend: 'stable' },
                compliance: { current: 8, trend: 'decreasing' },
                technical: { current: 5, trend: 'increasing' },
                operational: { current: 3, trend: 'stable' }
            }
        };
        return mockTrends;
    }
    async getRiskScenarios() {
        const mockScenarios = [
            {
                id: 'scenario-001',
                name: '市场暴跌情境',
                description: '加密货币市场整体下跌30%时的风险评估',
                probability: 0.25,
                impact: 'high',
                potentialLoss: 500000,
                timeframe: '1-7天',
                triggers: ['市场波动率>50%', 'BTC跌幅>25%', '大量提现请求'],
                mitigationStrategies: [
                    '暂停大额提现',
                    '增加风险监控频率',
                    '启动应急资金池'
                ],
                status: 'active',
                lastUpdated: new Date('2024-01-27T10:00:00Z')
            },
            {
                id: 'scenario-002',
                name: '系统性欺诈攻击',
                description: '协调性的大规模欺诈攻击情境',
                probability: 0.15,
                impact: 'critical',
                potentialLoss: 1000000,
                timeframe: '数小时',
                triggers: ['异常大量新注册', '相似IP地址集中', '批量KYC申请'],
                mitigationStrategies: [
                    '暂停新用户注册',
                    '加强身份验证',
                    '启动人工审核'
                ],
                status: 'monitoring',
                lastUpdated: new Date('2024-01-26T16:30:00Z')
            }
        ];
        return {
            scenarios: mockScenarios,
            total: mockScenarios.length
        };
    }
    async simulateRiskScenario(scenarioId) {
        return {
            scenarioId,
            simulationId: `sim-${Date.now()}`,
            results: {
                estimatedImpact: 0.75,
                affectedUsers: 1250,
                estimatedLoss: 375000,
                timeToContainment: '2-4小时',
                resourcesRequired: ['风控团队', '技术支持', '客服团队'],
                recommendations: [
                    '立即启动应急预案',
                    '通知相关监管机构',
                    '准备用户沟通方案'
                ]
            },
            status: 'completed',
            simulatedAt: new Date()
        };
    }
};
exports.RiskController = RiskController;
__decorate([
    (0, common_1.Post)('assessment'),
    (0, swagger_1.ApiOperation)({ summary: 'Perform risk assessment for withdrawal' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "performRiskAssessment", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get risk items' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getRiskItems", null);
__decorate([
    (0, common_1.Get)('trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get risk trends' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getRiskTrends", null);
__decorate([
    (0, common_1.Get)('scenarios'),
    (0, swagger_1.ApiOperation)({ summary: 'Get risk scenarios' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "getRiskScenarios", null);
__decorate([
    (0, common_1.Post)('scenarios/:id/simulate'),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate risk scenario' }),
    (0, auth_decorator_1.Auth)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RiskController.prototype, "simulateRiskScenario", null);
exports.RiskController = RiskController = __decorate([
    (0, swagger_1.ApiTags)('risk'),
    (0, common_1.Controller)('risk'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [risk_engine_service_1.RiskEngineService])
], RiskController);
//# sourceMappingURL=risk.controller.js.map