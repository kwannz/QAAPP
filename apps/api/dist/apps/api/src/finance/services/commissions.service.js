"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
let CommissionsService = class CommissionsService {
    constructor() {
        this.commissionRules = {
            minCommissionThreshold: 10,
            maxCommissionRate: 10,
            payoutFrequency: 'monthly',
            holdingPeriod: 30,
            levelStructure: [
                { level: 1, rate: 3.0, bonusThreshold: 100000 },
                { level: 2, rate: 2.5, bonusThreshold: 50000 },
                { level: 3, rate: 2.0, bonusThreshold: 25000 },
                { level: 4, rate: 1.5, bonusThreshold: 10000 },
                { level: 5, rate: 1.0, bonusThreshold: 5000 }
            ]
        };
        this.mockCommissions = [
            {
                id: 'comm-001',
                userId: 'agt-001',
                orderId: 'ord-001',
                commissionType: 'DIRECT_SALE',
                amount: 300,
                rate: 3.0,
                baseAmount: 10000,
                status: 'PAID',
                period: '2024-01',
                createdAt: '2024-01-15T00:00:00Z',
                paidAt: '2024-02-01T00:00:00Z'
            },
            {
                id: 'comm-002',
                userId: 'agt-001',
                orderId: 'ord-002',
                commissionType: 'REFERRAL_BONUS',
                amount: 150,
                rate: 1.5,
                baseAmount: 10000,
                status: 'PENDING',
                period: '2024-02',
                createdAt: '2024-02-10T00:00:00Z'
            }
        ];
    }
    async getUserCommissionHistory(userId, pagination) {
        const userCommissions = this.mockCommissions.filter(c => c.userId === userId);
        const total = userCommissions.length;
        const page = parseInt(pagination.page) || 1;
        const limit = parseInt(pagination.limit) || 20;
        const offset = (page - 1) * limit;
        return {
            data: userCommissions.slice(offset, offset + limit),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getUserCommissionSummary(userId) {
        const userCommissions = this.mockCommissions.filter(c => c.userId === userId);
        const totalEarned = userCommissions.reduce((sum, c) => sum + c.amount, 0);
        const pendingAmount = userCommissions
            .filter(c => c.status === 'PENDING')
            .reduce((sum, c) => sum + c.amount, 0);
        const paidAmount = userCommissions
            .filter(c => c.status === 'PAID')
            .reduce((sum, c) => sum + c.amount, 0);
        return {
            userId,
            summary: {
                totalEarned,
                pendingAmount,
                paidAmount,
                thisMonthEarnings: 150,
                lastMonthEarnings: 300,
                averageMonthlyEarnings: 225
            },
            breakdown: {
                directSales: userCommissions.filter(c => c.commissionType === 'DIRECT_SALE').length,
                referralBonuses: userCommissions.filter(c => c.commissionType === 'REFERRAL_BONUS').length,
                performanceBonuses: userCommissions.filter(c => c.commissionType === 'PERFORMANCE_BONUS').length
            }
        };
    }
    async getAdminCommissionList(filters) {
        let filtered = [...this.mockCommissions];
        if (filters.status) {
            filtered = filtered.filter(c => c.status === filters.status);
        }
        if (filters.type) {
            filtered = filtered.filter(c => c.commissionType === filters.type);
        }
        if (filters.period) {
            filtered = filtered.filter(c => c.period === filters.period);
        }
        if (filters.agentId) {
            filtered = filtered.filter(c => c.userId === filters.agentId);
        }
        const total = filtered.length;
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const offset = (page - 1) * limit;
        return {
            data: filtered.slice(offset, offset + limit),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getCommissionStats(period) {
        return {
            period: period || 'current',
            overview: {
                totalCommissions: 125000,
                pendingCommissions: 18500,
                paidCommissions: 106500,
                totalAgentsWithCommissions: 25,
                averageCommissionPerAgent: 5000
            },
            breakdown: {
                directSales: { amount: 75000, percentage: 60 },
                referralBonuses: { amount: 37500, percentage: 30 },
                performanceBonuses: { amount: 12500, percentage: 10 }
            },
            trends: {
                monthOverMonth: '+12%',
                topPerformingLevel: 1,
                averageCommissionRate: 2.8
            }
        };
    }
    async calculateCommissions(calculationData) {
        const { period, agentIds, includeSubAgents, forceRecalculate } = calculationData;
        return {
            success: true,
            period,
            calculationId: 'calc-' + Date.now(),
            summary: {
                totalCalculated: agentIds ? agentIds.length : 25,
                totalAmount: 18500,
                averagePerAgent: 740,
                includeSubAgents: includeSubAgents || false
            },
            results: [
                {
                    agentId: 'agt-001',
                    baseCommission: 5200,
                    bonusCommission: 800,
                    totalCommission: 6000,
                    commissionRate: 3.0,
                    volume: 200000
                }
            ],
            processingTime: '2.3 seconds'
        };
    }
    async processCommissionPayments(paymentData) {
        return {
            success: true,
            batchId: 'batch-' + Date.now(),
            summary: {
                totalProcessed: 25,
                totalAmount: 18500,
                successfulPayments: 24,
                failedPayments: 1,
                pendingPayments: 0
            },
            results: [
                {
                    commissionId: 'comm-001',
                    agentId: 'agt-001',
                    amount: 6000,
                    status: 'success',
                    transactionId: 'txn-001'
                }
            ],
            failedPayments: [
                {
                    commissionId: 'comm-002',
                    agentId: 'agt-002',
                    amount: 2800,
                    status: 'failed',
                    error: 'Insufficient wallet balance'
                }
            ]
        };
    }
    async getCommissionBreakdown(period, groupBy) {
        const grouping = groupBy || 'agent';
        if (grouping === 'agent') {
            return {
                period,
                groupBy,
                breakdown: [
                    {
                        agentId: 'agt-001',
                        agentName: 'agent1@example.com',
                        directSales: 3600,
                        referralBonuses: 1800,
                        performanceBonuses: 600,
                        total: 6000
                    }
                ]
            };
        }
        if (grouping === 'level') {
            return {
                period,
                groupBy,
                breakdown: [
                    { level: 1, count: 5, totalAmount: 30000, averageAmount: 6000 },
                    { level: 2, count: 8, totalAmount: 22400, averageAmount: 2800 },
                    { level: 3, count: 12, totalAmount: 18000, averageAmount: 1500 }
                ]
            };
        }
        return { period, groupBy, breakdown: [] };
    }
    async updateCommissionStructure(structureData) {
        return {
            success: true,
            message: 'Commission structure updated successfully',
            oldStructure: this.commissionRules.levelStructure.find(l => l.level === structureData.level),
            newStructure: structureData,
            effectiveDate: structureData.effectiveDate || new Date().toISOString(),
            affectedAgents: 15
        };
    }
    async getCommissionRules() {
        return {
            rules: this.commissionRules,
            lastUpdated: '2024-01-01T00:00:00Z',
            updatedBy: 'admin-001'
        };
    }
    async updateCommissionRules(rulesData) {
        Object.assign(this.commissionRules, rulesData);
        return {
            success: true,
            message: 'Commission rules updated successfully',
            updatedRules: rulesData,
            effectiveDate: new Date().toISOString()
        };
    }
    async generateCommissionReport(reportData) {
        return {
            success: true,
            reportId: 'report-' + Date.now(),
            type: reportData.type,
            period: reportData.period,
            format: reportData.format,
            downloadUrl: `/api/reports/commissions/${reportData.type}-${Date.now()}.${reportData.format}`,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            summary: {
                totalRecords: 125,
                totalAmount: 18500,
                generatedAt: new Date().toISOString()
            }
        };
    }
    async exportCommissions(exportData) {
        return {
            success: true,
            message: 'Commission export completed successfully',
            format: exportData.format,
            recordCount: this.mockCommissions.length,
            downloadUrl: '/api/downloads/commissions-export.csv',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
        };
    }
    async validateCommissions(validationData) {
        const { period, sampleSize } = validationData;
        const totalRecords = this.mockCommissions.length;
        const sampleRecords = Math.min(sampleSize || 10, totalRecords);
        return {
            success: true,
            period,
            validation: {
                totalRecords,
                sampleSize: sampleRecords,
                accuracyRate: 98.5,
                discrepancies: [
                    {
                        commissionId: 'comm-003',
                        issue: 'Rate calculation mismatch',
                        expectedAmount: 250,
                        actualAmount: 245,
                        difference: 5
                    }
                ],
                summary: {
                    passed: sampleRecords - 1,
                    failed: 1,
                    totalDiscrepancy: 5
                }
            }
        };
    }
    async retryFailedPayments(retryData) {
        return {
            success: true,
            retryBatchId: 'retry-' + Date.now(),
            summary: {
                totalRetried: 5,
                successfulRetries: 4,
                stillFailed: 1,
                totalAmount: 12000
            },
            results: [
                {
                    commissionId: 'comm-002',
                    status: 'success',
                    amount: 2800,
                    transactionId: 'txn-retry-001'
                }
            ]
        };
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)()
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map