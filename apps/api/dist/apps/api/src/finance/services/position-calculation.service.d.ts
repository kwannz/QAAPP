import { DatabaseService } from '../../database/database.service';
import { MultiLayerCacheService } from '../../cache/multi-layer-cache.service';
interface PayoutCalculation {
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    dailyRate: number;
    annualizedReturn: number;
}
interface PositionMetrics {
    totalPrincipal: number;
    totalEarnings: number;
    dailyEarnings: number;
    roi: number;
    daysActive: number;
    nextPayoutAmount: number;
    projectedTotalReturn: number;
}
export declare class PositionCalculationService {
    private readonly database;
    private readonly cache;
    private readonly logger;
    constructor(database: DatabaseService, cache: MultiLayerCacheService);
    calculatePayout(positionId: string, periodStart: Date, periodEnd: Date): Promise<PayoutCalculation>;
    calculatePositionMetrics(positionId: string): Promise<PositionMetrics>;
    calculateBatchPayouts(positionIds: string[], periodStart: Date, periodEnd: Date): Promise<Map<string, PayoutCalculation>>;
    calculatePortfolioValue(userId: string): Promise<{
        totalPrincipal: number;
        totalCurrentValue: number;
        totalEarnings: number;
        activePositions: number;
        portfolioROI: number;
    }>;
    predictFutureEarnings(positionId: string, days: number): Promise<{
        dailyEarnings: number;
        projectedEarnings: number;
        projectedTotal: number;
        confidenceLevel: number;
    }>;
    private calculateNextPayoutAmount;
    private isCompoundingEnabled;
}
export {};
