import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalType } from '@qa-app/database';

export interface RiskFactor {
  category: string;
  name: string;
  weight: number;
  score: number;
  description: string;
}

export interface RiskAssessmentResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: RiskFactor[];
  autoApproved: boolean;
  recommendation: string;
  warnings: string[];
  requiredActions: string[];
}

export interface WithdrawalRiskInput {
  userId: string;
  amount: number;
  withdrawalType: WithdrawalType;
  walletAddress: string;
  chainId: number;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  };
}

@Injectable()
export class RiskEngineService {
  constructor(private prisma: PrismaService) {}

  async performComprehensiveRiskAssessment(
    input: WithdrawalRiskInput
  ): Promise<RiskAssessmentResult> {
    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;

    // 1. 用户身份验证风险
    const identityRisk = await this.assessIdentityRisk(input.userId);
    riskFactors.push(...identityRisk.factors);
    totalScore += identityRisk.score;

    // 2. 交易行为风险
    const behaviorRisk = await this.assessBehaviorRisk(input.userId, input.amount, input.withdrawalType);
    riskFactors.push(...behaviorRisk.factors);
    totalScore += behaviorRisk.score;

    // 3. 技术安全风险
    const technicalRisk = await this.assessTechnicalRisk(input);
    riskFactors.push(...technicalRisk.factors);
    totalScore += technicalRisk.score;

    // 4. 合规风险
    const complianceRisk = await this.assessComplianceRisk(input);
    riskFactors.push(...complianceRisk.factors);
    totalScore += complianceRisk.score;

    // 5. 外部风险因子
    const externalRisk = await this.assessExternalRisk(input);
    riskFactors.push(...externalRisk.factors);
    totalScore += externalRisk.score;

    // 计算最终风险评分和等级
    const finalRiskScore = Math.min(100, Math.max(0, totalScore));
    const riskLevel = this.determineRiskLevel(finalRiskScore);
    
    // 生成建议和警告
    const { recommendation, warnings, requiredActions, autoApproved } = 
      this.generateRecommendations(finalRiskScore, riskLevel, riskFactors);

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

  private async assessIdentityRisk(userId: string): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
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

    // KYC状态检查
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
        // 已通过KYC，降低风险
        score -= 5;
        break;
    }

    // 账户年龄检查
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
    } else if (accountAgeInDays < 7) {
      factors.push({
        category: 'identity',
        name: 'new_account',
        weight: 0.2,
        score: 20,
        description: '账户创建不足7天',
      });
      score += 20;
    } else if (accountAgeInDays < 30) {
      factors.push({
        category: 'identity',
        name: 'young_account',
        weight: 0.1,
        score: 10,
        description: '账户创建不足30天',
      });
      score += 10;
    }

    // 活跃度检查
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

  private async assessBehaviorRisk(
    userId: string,
    amount: number,
    type: WithdrawalType
  ): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // 获取历史提现记录
    const historicalWithdrawals = await this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 频率分析
    const last24h = historicalWithdrawals.filter(
      w => w.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const last7d = historicalWithdrawals.filter(
      w => w.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (last24h.length >= 5) {
      factors.push({
        category: 'behavior',
        name: 'high_frequency_24h',
        weight: 0.35,
        score: 35,
        description: '24小时内高频提现',
      });
      score += 35;
    } else if (last24h.length >= 3) {
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

    // 金额分析
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

    // 绝对金额风险
    if (amount >= 100000) {
      factors.push({
        category: 'behavior',
        name: 'very_large_amount',
        weight: 0.4,
        score: 40,
        description: '超大额提现（≥10万）',
      });
      score += 40;
    } else if (amount >= 50000) {
      factors.push({
        category: 'behavior',
        name: 'large_amount',
        weight: 0.3,
        score: 30,
        description: '大额提现（≥5万）',
      });
      score += 30;
    } else if (amount >= 10000) {
      factors.push({
        category: 'behavior',
        name: 'medium_amount',
        weight: 0.15,
        score: 15,
        description: '中等金额提现（≥1万）',
      });
      score += 15;
    }

    // 拒绝历史分析
    const rejectedWithdrawals = historicalWithdrawals.filter(w => w.status === 'REJECTED');
    const recentRejected = rejectedWithdrawals.filter(
      w => w.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    if (recentRejected.length >= 3) {
      factors.push({
        category: 'behavior',
        name: 'multiple_recent_rejections',
        weight: 0.35,
        score: 35,
        description: '近期多次提现被拒',
      });
      score += 35;
    } else if (recentRejected.length >= 1) {
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

  private async assessTechnicalRisk(
    input: WithdrawalRiskInput
  ): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // 钱包地址格式验证
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

    // 检查黑名单地址
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

    // IP地址风险检查
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
      } else if (ipRisk.isMediumRisk) {
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

    // 设备指纹检查
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

  private async assessComplianceRisk(
    input: WithdrawalRiskInput
  ): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // AML检查 - 模拟实现
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
    } else if (amlRisk.isMediumRisk) {
      factors.push({
        category: 'compliance',
        name: 'aml_medium_risk',
        weight: 0.3,
        score: 30,
        description: `AML中等风险: ${amlRisk.reason}`,
      });
      score += 30;
    }

    // 制裁名单检查
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

    // 监管要求检查
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

  private async assessExternalRisk(
    input: WithdrawalRiskInput
  ): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // 市场波动性检查
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

    // 网络拥堵检查
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

  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  private generateRecommendations(
    riskScore: number,
    riskLevel: string,
    riskFactors: RiskFactor[]
  ): {
    recommendation: string;
    warnings: string[];
    requiredActions: string[];
    autoApproved: boolean;
  } {
    const warnings: string[] = [];
    const requiredActions: string[] = [];
    let recommendation: string = 'Unknown risk level';
    let autoApproved = false;

    // 检查关键风险因素
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

  // 辅助方法实现
  private isValidWalletAddress(address: string, chainId: number): boolean {
    // 简化的地址格式验证
    if (!address || address.length < 20) return false;
    
    switch (chainId) {
      case 1: // Ethereum
      case 56: // BSC
      case 137: // Polygon
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      default:
        return false;
    }
  }

  private async isBlacklistedAddress(address: string): Promise<boolean> {
    // 模拟黑名单检查
    const blacklistedAddresses = [
      '0x0000000000000000000000000000000000000000',
      // 其他已知恶意地址...
    ];
    return blacklistedAddresses.includes(address.toLowerCase());
  }

  private async assessIpRisk(ipAddress: string): Promise<{
    isHighRisk: boolean;
    isMediumRisk: boolean;
    reason: string;
  }> {
    // 模拟IP风险评估
    const knownVpnRanges = ['10.0.', '192.168.', '172.16.'];
    const knownTorExits: string[] = []; // 实际应该从数据库获取

    if (knownTorExits.includes(ipAddress)) {
      return { isHighRisk: true, isMediumRisk: false, reason: 'Tor出口节点' };
    }

    if (knownVpnRanges.some(range => ipAddress.startsWith(range))) {
      return { isHighRisk: false, isMediumRisk: true, reason: 'VPN/代理服务器' };
    }

    return { isHighRisk: false, isMediumRisk: false, reason: '' };
  }

  private async assessDeviceRisk(userId: string, deviceFingerprint: string): Promise<{
    isNewDevice: boolean;
  }> {
    // 模拟设备风险评估
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

  private async performAMLCheck(input: WithdrawalRiskInput): Promise<{
    isHighRisk: boolean;
    isMediumRisk: boolean;
    reason: string;
  }> {
    // 模拟AML检查
    if (input.amount >= 50000) {
      return { 
        isHighRisk: false, 
        isMediumRisk: true, 
        reason: '大额交易需要额外监控' 
      };
    }

    return { isHighRisk: false, isMediumRisk: false, reason: '' };
  }

  private async checkSanctionsList(address: string): Promise<{ isListed: boolean }> {
    // 模拟制裁名单检查
    return { isListed: false };
  }

  private async assessRegulatoryRisk(input: WithdrawalRiskInput): Promise<{
    requiresReporting: boolean;
  }> {
    // 模拟监管风险评估
    return { 
      requiresReporting: input.amount >= 10000 // FINCEN报告阈值
    };
  }

  private async getMarketConditions(): Promise<{ isHighVolatility: boolean }> {
    // 模拟市场条件检查
    return { isHighVolatility: false };
  }

  private async getNetworkStatus(chainId: number): Promise<{ isCongested: boolean }> {
    // 模拟网络状态检查
    return { isCongested: false };
  }
}