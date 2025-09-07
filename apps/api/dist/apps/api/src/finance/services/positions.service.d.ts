import { DatabaseService } from '../../database/database.service';
import { MockPosition } from '../interfaces/mapping.interface';
export declare class PositionsService {
    private database;
    private readonly logger;
    constructor(database: DatabaseService);
    createPosition(orderData: any, productData: any): Promise<MockPosition>;
    getUserPositions(userId: string, queryDto?: any): Promise<{
        positions: MockPosition[];
        total: number;
        summary: {
            totalActive: number;
            totalPrincipal: number;
            totalPaid: number;
            estimatedTotal: number;
        };
    }>;
    getPosition(positionId: string, userId?: string): Promise<MockPosition>;
    getActivePositions(): Promise<MockPosition[]>;
    updatePositionStatus(positionId: string, status: MockPosition['status']): Promise<MockPosition>;
    recordPayoutPayment(positionId: string, payoutAmount: number): Promise<MockPosition>;
    redeemPosition(positionId: string, userId: string): Promise<{
        position: MockPosition;
        redeemAmount: number;
        txHash?: string;
    }>;
    getSystemPositionStats(): Promise<{
        totalPositions: number;
        activePositions: number;
        totalValueLocked: number;
        totalValuePaid: number;
        positionsByStatus: Record<string, number>;
    }>;
    private getNextPayoutDate;
    private calculateMaturityAmount;
    initializeTestData(): Promise<void>;
}
