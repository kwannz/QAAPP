import { PrismaService } from '../../prisma/prisma.service';
import { WithdrawalStatus, WithdrawalType, RiskLevel, Prisma } from '@qa-app/database';
import { RiskEngineService } from '../../risk/risk-engine.service';
import { PerformanceOptimizerService } from '../../common/performance/performance-optimizer.service';
export interface CreateWithdrawalDto {
    userId: string;
    amount: number;
    withdrawalType: WithdrawalType;
    walletAddress: string;
    chainId: number;
}
export interface UpdateWithdrawalDto {
    status?: WithdrawalStatus;
    reviewNotes?: string;
    rejectionReason?: string;
    reviewerId?: string;
}
export interface WithdrawalQueryDto {
    status?: WithdrawalStatus;
    riskLevel?: RiskLevel;
    userId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class WithdrawalsService {
    private prisma;
    private riskEngine;
    private performanceOptimizer;
    private readonly logger;
    constructor(prisma: PrismaService, riskEngine: RiskEngineService, performanceOptimizer: PerformanceOptimizerService);
    createWithdrawal(createDto: CreateWithdrawalDto, actorId: string): Promise<any>;
    getWithdrawals(query: WithdrawalQueryDto): Promise<{
        withdrawals: ({
            user: {
                email: string | null;
                referralCode: string;
                id: string;
                kycStatus: import("@qa-app/database").$Enums.KycStatus;
            };
        } & {
            walletAddress: string;
            chainId: number;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: Prisma.JsonValue | null;
            platformFee: Prisma.Decimal;
            txHash: string | null;
            status: import("@qa-app/database").$Enums.WithdrawalStatus;
            amount: Prisma.Decimal;
            batchId: string | null;
            completedAt: Date | null;
            withdrawalType: import("@qa-app/database").$Enums.WithdrawalType;
            actualAmount: Prisma.Decimal;
            blockNumber: number | null;
            gasUsed: number | null;
            gasFee: Prisma.Decimal | null;
            riskScore: number;
            riskLevel: import("@qa-app/database").$Enums.RiskLevel;
            riskFactors: Prisma.JsonValue | null;
            autoApproved: boolean;
            reviewerId: string | null;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            rejectionReason: string | null;
            processedAt: Date | null;
            processedBy: string | null;
            requestedAt: Date;
            scheduledAt: Date | null;
            kycVerified: boolean;
            amlCheckPassed: boolean;
            complianceNotes: string | null;
            internalNotes: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getWithdrawalById(id: string): Promise<any>;
    updateWithdrawal(id: string, updateDto: UpdateWithdrawalDto, actorId: string): Promise<any>;
    batchUpdateWithdrawals(ids: string[], updateDto: UpdateWithdrawalDto, actorId: string): Promise<{
        updated: number;
        failed: string[];
    }>;
    getWithdrawalStats(): Promise<any>;
    private validateUserBalance;
    private calculateWithdrawalFee;
    private isKycVerified;
    private validateStatusTransition;
}
