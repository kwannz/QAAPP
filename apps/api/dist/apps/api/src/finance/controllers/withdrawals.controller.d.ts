import { WithdrawalsService, CreateWithdrawalDto, UpdateWithdrawalDto, WithdrawalQueryDto } from '../services/withdrawals.service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types';
export declare class WithdrawalsController {
    private readonly withdrawalsService;
    private readonly logger;
    constructor(withdrawalsService: WithdrawalsService);
    createWithdrawal(createDto: CreateWithdrawalDto, req: AuthenticatedRequest): Promise<any>;
    getWithdrawals(query: WithdrawalQueryDto, res: Response): Promise<{
        withdrawals: ({
            user: {
                email: string | null;
                referralCode: string;
                id: string;
                kycStatus: import("@prisma/client").$Enums.KycStatus;
            };
        } & {
            walletAddress: string;
            chainId: number;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            platformFee: import("@qa-app/database").Decimal;
            txHash: string | null;
            status: import("@prisma/client").$Enums.WithdrawalStatus;
            amount: import("@qa-app/database").Decimal;
            batchId: string | null;
            completedAt: Date | null;
            withdrawalType: import("@prisma/client").$Enums.WithdrawalType;
            actualAmount: import("@qa-app/database").Decimal;
            blockNumber: number | null;
            gasUsed: number | null;
            gasFee: import("@qa-app/database").Decimal | null;
            riskScore: number;
            riskLevel: import("@prisma/client").$Enums.RiskLevel;
            riskFactors: import("@prisma/client/runtime/library").JsonValue | null;
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
    getWithdrawalStats(res: Response): Promise<any>;
    getWithdrawalById(id: string, res: Response): Promise<any>;
    updateWithdrawal(id: string, updateDto: UpdateWithdrawalDto, req: AuthenticatedRequest, res: Response): Promise<any>;
    batchUpdateWithdrawals(batchData: {
        ids: string[];
        updateDto: UpdateWithdrawalDto;
    }, req: AuthenticatedRequest, res: Response): Promise<{
        updated: number;
        failed: string[];
    }>;
}
