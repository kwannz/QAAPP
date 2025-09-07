import { DatabaseService } from './database.service';
export declare class QueryOptimizerService {
    private readonly db;
    private readonly logger;
    constructor(db: DatabaseService);
    findUserWithDetails(userId: string): Promise<any>;
    findUserOrders(userId: string, limit?: number, offset?: number): Promise<any>;
    findClaimablePayouts(userId: string): Promise<any>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        activePositions: number;
        totalVolume: number | import("@qa-app/database").Decimal;
        pendingWithdrawals: number;
        timestamp: string;
    }>;
    findUsersWithPositions(userIds: string[]): Promise<any>;
    findOrdersPaginated(filters: {
        userId?: string;
        status?: string;
        productId?: string;
        startDate?: Date;
        endDate?: Date;
    }, page?: number, limit?: number): Promise<any>;
    getFinancialSummary(userId: string): Promise<{
        totalInvestment: number | import("@qa-app/database").Decimal;
        activeInvestment: number | import("@qa-app/database").Decimal;
        activePositionCount: number;
        totalEarnings: number | import("@qa-app/database").Decimal;
        pendingEarnings: number | import("@qa-app/database").Decimal;
        pendingPayoutCount: number;
        queryTime: number;
    }>;
}
