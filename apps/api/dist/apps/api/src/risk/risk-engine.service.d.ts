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
export declare class RiskEngineService {
    private prisma;
    constructor(prisma: PrismaService);
    performComprehensiveRiskAssessment(input: WithdrawalRiskInput): Promise<RiskAssessmentResult>;
    private assessIdentityRisk;
    private assessBehaviorRisk;
    private assessTechnicalRisk;
    private assessComplianceRisk;
    private assessExternalRisk;
    private determineRiskLevel;
    private generateRecommendations;
    private isValidWalletAddress;
    private isBlacklistedAddress;
    private assessIpRisk;
    private assessDeviceRisk;
    private performAMLCheck;
    private checkSanctionsList;
    private assessRegulatoryRisk;
    private getMarketConditions;
    private getNetworkStatus;
}
