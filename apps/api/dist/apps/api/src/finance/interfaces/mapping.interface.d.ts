export declare class FinanceMappingUtils {
    static nullToUndefined<T>(value: T | null): T | undefined;
    static mapDatabasePositionToMock(position: any): any;
    static mapDatabasePayoutToMock(payout: any): any;
}
export interface MockPosition {
    id: string;
    userId: string;
    productId: string;
    orderId: string;
    principal: number;
    startDate: Date;
    endDate: Date;
    nextPayoutAt?: Date;
    nftTokenId?: number;
    nftTokenUri?: string;
    status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED';
    totalPaid: number;
    lastPayoutAt?: Date;
    maturityAmount?: number;
    createdAt: Date;
    updatedAt: Date;
    metadata?: any;
}
export interface MockPayout {
    id: string;
    userId: string;
    positionId: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    status: string;
    isClaimable: boolean;
    claimedAt?: Date;
    txHash?: string;
    createdAt: Date;
    updatedAt: Date;
}
