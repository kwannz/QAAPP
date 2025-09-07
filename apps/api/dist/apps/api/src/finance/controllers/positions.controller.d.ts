import { PositionsService } from '../services/positions.service';
import { QueryFilters } from '../../common/types/express.types';
export declare class PositionsController {
    private readonly positionsService;
    constructor(positionsService: PositionsService);
    getUserPositions(userId: string, queryDto: QueryFilters): Promise<{
        positions: import("../interfaces/mapping.interface").MockPosition[];
        total: number;
        summary: {
            totalActive: number;
            totalPrincipal: number;
            totalPaid: number;
            estimatedTotal: number;
        };
    }>;
    getSystemStats(): Promise<{
        totalPositions: number;
        activePositions: number;
        totalValueLocked: number;
        totalValuePaid: number;
        positionsByStatus: Record<string, number>;
    }>;
    getActivePositions(): Promise<import("../interfaces/mapping.interface").MockPosition[]>;
    getPosition(id: string, userId?: string): Promise<import("../interfaces/mapping.interface").MockPosition>;
    createPosition(createPositionDto: {
        orderData: any;
        productData: any;
    }): Promise<import("../interfaces/mapping.interface").MockPosition>;
    updateStatus(id: string, updateDto: {
        status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED';
    }): Promise<import("../interfaces/mapping.interface").MockPosition>;
    redeemPosition(id: string, redeemDto: {
        userId: string;
    }): Promise<{
        position: import("../interfaces/mapping.interface").MockPosition;
        redeemAmount: number;
        txHash?: string;
    }>;
    recordPayout(id: string, payoutDto: {
        amount: number;
    }): Promise<import("../interfaces/mapping.interface").MockPosition>;
    initializeTestData(): Promise<{
        message: string;
    }>;
}
