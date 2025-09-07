import { Response } from 'express';
import { PayoutsService } from '../services/payouts.service';
import { PositionsService } from '../services/positions.service';
declare class ClaimPayoutsDto {
    userId: string;
    payoutIds: string[];
}
declare class PayoutDto {
    id: string;
    userId: string;
    positionId: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    isClaimable: boolean;
    claimedAt?: string;
    claimTxHash?: string;
    createdAt: string;
    updatedAt: string;
}
declare class ClaimablePayoutsResponseDto {
    payouts: PayoutDto[];
    totalAmount: number;
}
declare class PayoutHistoryResponseDto {
    payouts: PayoutDto[];
    total: number;
    totalClaimed: number;
    totalPending: number;
}
declare class ClaimResponseDto {
    success: boolean;
    claimedAmount: number;
    txHash: string;
    claimedPayouts: string[];
}
export declare class PayoutsController {
    private payoutsService;
    private positionsService;
    private readonly logger;
    constructor(payoutsService: PayoutsService, positionsService: PositionsService);
    getUserClaimablePayouts(userId: string, res: Response): Promise<ClaimablePayoutsResponseDto>;
    getUserPayoutHistory(userId: string, page: string | undefined, limit: string | undefined, res: Response): Promise<PayoutHistoryResponseDto>;
    claimPayouts(claimDto: ClaimPayoutsDto, res: Response): Promise<ClaimResponseDto>;
    getPayoutById(payoutId: string): Promise<PayoutDto>;
}
export {};
