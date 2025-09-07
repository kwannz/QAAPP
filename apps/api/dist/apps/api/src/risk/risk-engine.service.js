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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RiskEngineService = class RiskEngineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async performComprehensiveRiskAssessment(input) {
        const riskFactors = [];
        let totalScore = 0;
        const identityRisk = await this.assessIdentityRisk(input.userId);
        riskFactors.push(...identityRisk.factors);
        totalScore += identityRisk.score;
        const behaviorRisk = await this.assessBehaviorRisk(input.userId, input.amount, input.withdrawalType);
        riskFactors.push(...behaviorRisk.factors);
        totalScore += behaviorRisk.score;
        const technicalRisk = await this.assessTechnicalRisk(input);
        riskFactors.push(...technicalRisk.factors);
        totalScore += technicalRisk.score;
        const complianceRisk = await this.assessComplianceRisk(input);
        riskFactors.push(...complianceRisk.factors);
        totalScore += complianceRisk.score;
        const externalRisk = await this.assessExternalRisk(input);
        riskFactors.push(...externalRisk.factors);
        totalScore += externalRisk.score;
        const finalRiskScore = Math.min(100, Math.max(0, totalScore));
        const riskLevel = this.determineRiskLevel(finalRiskScore);
        const { recommendation, warnings, requiredActions, autoApproved } = this.generateRecommendations(finalRiskScore, riskLevel, riskFactors);
        return {
            riskScore: finalRiskScore,
            riskLevel,
            riskFactors,
            autoApproved,
            recommendation,
            warnings,
            requiredActions,
        };
    }
    async assessIdentityRisk(userId) {
        const factors = [];
        let score = 0;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                kycStatus: true,
                createdAt: true,
                lastLoginAt: true,
                email: true,
            },
        });
        if (!user) {
            factors.push({
                category: 'identity',
                name: 'user_not_found',
                weight: 100,
                score: 100,
                description: '用户不存在',
            });
            return { score: 100, factors };
        }
        switch (user.kycStatus) {
            case 'PENDING':
                factors.push({
                    category: 'identity',
                    name: 'kyc_pending',
                    weight: 0.4,
                    score: 40,
                    description: 'KYC审核待处理',
                });
                score += 40;
                break;
            case 'REJECTED':
                factors.push({
                    category: 'identity',
                    name: 'kyc_rejected',
                    weight: 0.6,
                    score: 60,
                    description: 'KYC审核被拒绝',
                });
                score += 60;
                break;
            case 'EXPIRED':
                factors.push({
                    category: 'identity',
                    name: 'kyc_expired',
                    weight: 0.5,
                    score: 50,
                    description: 'KYC认证已过期',
                });
                score += 50;
                break;
            case 'APPROVED':
                score -= 5;
                break;
        }
        const accountAgeInDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (accountAgeInDays < 1) {
            factors.push({
                category: 'identity',
                name: 'very_new_account',
                weight: 0.3,
                score: 30,
                description: '账户创建不足1天',
            });
            score += 30;
        }
        else if (accountAgeInDays < 7) {
            factors.push({
                category: 'identity',
                name: 'new_account',
                weight: 0.2,
                score: 20,
                description: '账户创建不足7天',
            });
            score += 20;
        }
        else if (accountAgeInDays < 30) {
            factors.push({
                category: 'identity',
                name: 'young_account',
                weight: 0.1,
                score: 10,
                description: '账户创建不足30天',
            });
            score += 10;
        }
        if (user.lastLoginAt) {
            const daysSinceLastLogin = (Date.now() - user.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastLogin > 90) {
                factors.push({
                    category: 'identity',
                    name: 'inactive_account',
                    weight: 0.15,
                    score: 15,
                    description: '账户长期未登录',
                });
                score += 15;
            }
        }
        return { score, factors };
    }
    async assessBehaviorRisk(userId, amount, type) {
        const factors = [];
        let score = 0;
        const historicalWithdrawals = await this.prisma.withdrawal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const last24h = historicalWithdrawals.filter(w => w.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000));
        const last7d = historicalWithdrawals.filter(w => w.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        if (last24h.length >= 5) {
            factors.push({
                category: 'behavior',
                name: 'high_frequency_24h',
                weight: 0.35,
                score: 35,
                description: '24小时内高频提现',
            });
            score += 35;
        }
        else if (last24h.length >= 3) {
            factors.push({
                category: 'behavior',
                name: 'medium_frequency_24h',
                weight: 0.20,
                score: 20,
                description: '24小时内频繁提现',
            });
            score += 20;
        }
        if (last7d.length >= 15) {
            factors.push({
                category: 'behavior',
                name: 'high_frequency_7d',
                weight: 0.25,
                score: 25,
                description: '7天内高频提现',
            });
            score += 25;
        }
        if (historicalWithdrawals.length > 0) {
            const amounts = historicalWithdrawals.map(w => Number(w.amount));
            const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const maxAmount = Math.max(...amounts);
            if (amount > avgAmount * 5) {
                factors.push({
                    category: 'behavior',
                    name: 'unusual_amount_vs_avg',
                    weight: 0.3,
                    score: 30,
                    description: '提现金额远超历史平均值',
                });
                score += 30;
            }
            if (amount > maxAmount * 2) {
                factors.push({
                    category: 'behavior',
                    name: 'unusual_amount_vs_max',
                    weight: 0.25,
                    score: 25,
                    description: '提现金额远超历史最大值',
                });
                score += 25;
            }
        }
        if (amount >= 100000) {
            factors.push({
                category: 'behavior',
                name: 'very_large_amount',
                weight: 0.4,
                score: 40,
                description: '超大额提现（≥10万）',
            });
            score += 40;
        }
        else if (amount >= 50000) {
            factors.push({
                category: 'behavior',
                name: 'large_amount',
                weight: 0.3,
                score: 30,
                description: '大额提现（≥5万）',
            });
            score += 30;
        }
        else if (amount >= 10000) {
            factors.push({
                category: 'behavior',
                name: 'medium_amount',
                weight: 0.15,
                score: 15,
                description: '中等金额提现（≥1万）',
            });
            score += 15;
        }
        const rejectedWithdrawals = historicalWithdrawals.filter(w => w.status === 'REJECTED');
        const recentRejected = rejectedWithdrawals.filter(w => w.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        if (recentRejected.length >= 3) {
            factors.push({
                category: 'behavior',
                name: 'multiple_recent_rejections',
                weight: 0.35,
                score: 35,
                description: '近期多次提现被拒',
            });
            score += 35;
        }
        else if (recentRejected.length >= 1) {
            factors.push({
                category: 'behavior',
                name: 'recent_rejection',
                weight: 0.15,
                score: 15,
                description: '近期有提现被拒记录',
            });
            score += 15;
        }
        return { score, factors };
    }
    async assessTechnicalRisk(input) {
        const factors = [];
        let score = 0;
        if (!this.isValidWalletAddress(input.walletAddress, input.chainId)) {
            factors.push({
                category: 'technical',
                name: 'invalid_wallet_format',
                weight: 0.3,
                score: 30,
                description: '钱包地址格式无效',
            });
            score += 30;
        }
        const isBlacklisted = await this.isBlacklistedAddress(input.walletAddress);
        if (isBlacklisted) {
            factors.push({
                category: 'technical',
                name: 'blacklisted_address',
                weight: 0.8,
                score: 80,
                description: '钱包地址在黑名单中',
            });
            score += 80;
        }
        if (input.metadata?.ipAddress) {
            const ipRisk = await this.assessIpRisk(input.metadata.ipAddress);
            if (ipRisk.isHighRisk) {
                factors.push({
                    category: 'technical',
                    name: 'high_risk_ip',
                    weight: 0.4,
                    score: 40,
                    description: `高风险IP地址: ${ipRisk.reason}`,
                });
                score += 40;
            }
            else if (ipRisk.isMediumRisk) {
                factors.push({
                    category: 'technical',
                    name: 'medium_risk_ip',
                    weight: 0.2,
                    score: 20,
                    description: `中等风险IP地址: ${ipRisk.reason}`,
                });
                score += 20;
            }
        }
        if (input.metadata?.deviceFingerprint) {
            const deviceRisk = await this.assessDeviceRisk(input.userId, input.metadata.deviceFingerprint);
            if (deviceRisk.isNewDevice) {
                factors.push({
                    category: 'technical',
                    name: 'new_device',
                    weight: 0.15,
                    score: 15,
                    description: '使用新设备进行提现',
                });
                score += 15;
            }
        }
        return { score, factors };
    }
    async assessComplianceRisk(input) {
        const factors = [];
        let score = 0;
        const amlRisk = await this.performAMLCheck(input);
        if (amlRisk.isHighRisk) {
            factors.push({
                category: 'compliance',
                name: 'aml_high_risk',
                weight: 0.7,
                score: 70,
                description: `AML高风险: ${amlRisk.reason}`,
            });
            score += 70;
        }
        else if (amlRisk.isMediumRisk) {
            factors.push({
                category: 'compliance',
                name: 'aml_medium_risk',
                weight: 0.3,
                score: 30,
                description: `AML中等风险: ${amlRisk.reason}`,
            });
            score += 30;
        }
        const sanctionCheck = await this.checkSanctionsList(input.walletAddress);
        if (sanctionCheck.isListed) {
            factors.push({
                category: 'compliance',
                name: 'sanctions_listed',
                weight: 1.0,
                score: 100,
                description: '地址在制裁名单中',
            });
            score += 100;
        }
        const regulatoryRisk = await this.assessRegulatoryRisk(input);
        if (regulatoryRisk.requiresReporting) {
            factors.push({
                category: 'compliance',
                name: 'requires_reporting',
                weight: 0.1,
                score: 10,
                description: '超过监管报告阈值',
            });
            score += 10;
        }
        return { score, factors };
    }
    async assessExternalRisk(input) {
        const factors = [];
        let score = 0;
        const marketConditions = await this.getMarketConditions();
        if (marketConditions.isHighVolatility) {
            factors.push({
                category: 'external',
                name: 'high_market_volatility',
                weight: 0.1,
                score: 10,
                description: '市场波动性较高',
            });
            score += 10;
        }
        const networkStatus = await this.getNetworkStatus(input.chainId);
        if (networkStatus.isCongested) {
            factors.push({
                category: 'external',
                name: 'network_congestion',
                weight: 0.05,
                score: 5,
                description: '网络拥堵，处理延迟',
            });
            score += 5;
        }
        return { score, factors };
    }
    determineRiskLevel(score) {
        if (score >= 80)
            return 'CRITICAL';
        if (score >= 50)
            return 'HIGH';
        if (score >= 25)
            return 'MEDIUM';
        return 'LOW';
    }
    generateRecommendations(riskScore, riskLevel, riskFactors) {
        const warnings = [];
        const requiredActions = [];
        let recommendation = 'Unknown risk level';
        let autoApproved = false;
        const criticalFactors = riskFactors.filter(f => f.score >= 50);
        const hasKycIssues = riskFactors.some(f => f.name.includes('kyc'));
        const hasBlacklistIssues = riskFactors.some(f => f.name === 'blacklisted_address' || f.name === 'sanctions_listed');
        switch (riskLevel) {
            case 'LOW':
                recommendation = '低风险，建议自动批准';
                autoApproved = true;
                break;
            case 'MEDIUM':
                recommendation = '中等风险，建议人工审核';
                warnings.push('存在一定风险因素，建议仔细审核');
                if (hasKycIssues) {
                    requiredActions.push('验证用户KYC状态');
                }
                break;
            case 'HIGH':
                recommendation = '高风险，需要详细审核和额外验证';
                warnings.push('存在多个风险因素');
                warnings.push('建议联系用户进行额外验证');
                if (hasKycIssues) {
                    requiredActions.push('要求用户完成或更新KYC认证');
                }
                const highAmountFactor = riskFactors.find(f => f.name.includes('amount'));
                if (highAmountFactor) {
                    requiredActions.push('验证资金来源');
                }
                const frequencyFactor = riskFactors.find(f => f.name.includes('frequency'));
                if (frequencyFactor) {
                    requiredActions.push('分析提现模式和动机');
                }
                break;
            case 'CRITICAL':
                recommendation = '极高风险，强烈建议拒绝或需要高级别审批';
                warnings.push('存在严重风险因素');
                warnings.push('可能涉及违法违规行为');
                if (hasBlacklistIssues) {
                    warnings.push('涉及制裁或黑名单地址');
                    requiredActions.push('立即冻结相关账户');
                }
                if (criticalFactors.length > 0) {
                    requiredActions.push('进行全面调查');
                    requiredActions.push('考虑报告给相关监管部门');
                }
                break;
        }
        return {
            recommendation,
            warnings,
            requiredActions,
            autoApproved,
        };
    }
    isValidWalletAddress(address, chainId) {
        if (!address || address.length < 20)
            return false;
        switch (chainId) {
            case 1:
            case 11_155_111:
            case 31_337:
            case 56:
            case 137:
                return /^0x[a-fA-F0-9]{40}$/.test(address);
            default:
                return false;
        }
    }
    async isBlacklistedAddress(address) {
        const blacklistedAddresses = [
            '0x0000000000000000000000000000000000000000',
        ];
        return blacklistedAddresses.includes(address.toLowerCase());
    }
    async assessIpRisk(ipAddress) {
        const knownVpnRanges = ['10.0.', '192.168.', '172.16.'];
        const knownTorExits = [];
        if (knownTorExits.includes(ipAddress)) {
            return { isHighRisk: true, isMediumRisk: false, reason: 'Tor出口节点' };
        }
        if (knownVpnRanges.some(range => ipAddress.startsWith(range))) {
            return { isHighRisk: false, isMediumRisk: true, reason: 'VPN/代理服务器' };
        }
        return { isHighRisk: false, isMediumRisk: false, reason: '' };
    }
    async assessDeviceRisk(userId, deviceFingerprint) {
        const knownDevices = await this.prisma.auditLog.findMany({
            where: {
                actorId: userId,
                metadata: {
                    path: ['deviceFingerprint'],
                    equals: deviceFingerprint,
                },
            },
            take: 1,
        });
        return { isNewDevice: knownDevices.length === 0 };
    }
    async performAMLCheck(input) {
        if (input.amount >= 50000) {
            return {
                isHighRisk: false,
                isMediumRisk: true,
                reason: '大额交易需要额外监控'
            };
        }
        return { isHighRisk: false, isMediumRisk: false, reason: '' };
    }
    async checkSanctionsList(address) {
        return { isListed: false };
    }
    async assessRegulatoryRisk(input) {
        return {
            requiresReporting: input.amount >= 10000
        };
    }
    async getMarketConditions() {
        return { isHighVolatility: false };
    }
    async getNetworkStatus(chainId) {
        return { isCongested: false };
    }
};
exports.RiskEngineService = RiskEngineService;
exports.RiskEngineService = RiskEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RiskEngineService);
//# sourceMappingURL=risk-engine.service.js.map