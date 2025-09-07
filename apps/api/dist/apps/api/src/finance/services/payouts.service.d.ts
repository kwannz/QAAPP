import { DatabaseService } from '../../database/database.service';
import { MockPayout } from '../interfaces/mapping.interface';
export declare class PayoutsService {
    private database;
    private readonly logger;
    constructor(database: DatabaseService);
    private calculateDailyPayout;
    generateDailyPayouts(): Promise<void>;
    private getActivePositions;
    private findPayoutByPositionAndDate;
    private createPayout;
    getClaimablePayouts(userId: string): Promise<{
        payouts: MockPayout[];
        totalAmount: number;
    }>;
    claimPayouts(userId: string, payoutIds: string[]): Promise<{
        claimedAmount: number;
        txHash?: string;
        claimedPayouts: MockPayout[];
    }>;
    getPayoutHistory(userId: string, queryDto?: any): Promise<{
        payouts: MockPayout[];
        total: number;
        totalClaimed: number;
        totalPending: number;
    }>;
    getSystemPayoutStats(): Promise<{
        totalDistributed: number;
        totalPending: number;
        activePositions: number;
        totalUsers: number;
    }>;
    generateClaimablePayouts(positionId: string, userId: string): Promise<MockPayout[]>;
    getPositionPayouts(positionId: string): Promise<MockPayout[]>;
    findPayoutById(payoutId: string): Promise<MockPayout | null>;
    claimMultiplePayouts(payoutIds: string[], userId: string): Promise<{
        success: boolean;
        totalAmount: number;
        txHash: string;
        message?: string;
    }>;
}
