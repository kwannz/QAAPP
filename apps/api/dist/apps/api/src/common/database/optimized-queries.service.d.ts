import { DatabaseService } from '../../database/database.service';
import { PerformanceOptimizerService } from '../performance/performance-optimizer.service';
import { UserRole, KycStatus } from '@qa-app/database';
export interface OptimizedUserQuery {
    id?: string;
    email?: string;
    role?: UserRole;
    kycStatus?: KycStatus;
    isActive?: boolean;
    page?: number;
    limit?: number;
    includeWallets?: boolean;
    includeStats?: boolean;
}
export interface OptimizedTransactionQuery {
    userId?: string;
    type?: 'ORDER' | 'COMMISSION' | 'WITHDRAWAL' | 'PAYOUT';
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export declare class OptimizedQueriesService {
    private database;
    private performanceOptimizer;
    private readonly logger;
    constructor(database: DatabaseService, performanceOptimizer: PerformanceOptimizerService);
    findUsers(query: OptimizedUserQuery): Promise<{
        users: {
            [x: string]: {
                address: string;
                chainId: number;
                id: string;
                userId: string;
                isPrimary: boolean;
                label: string | null;
                createdAt: Date;
            }[] | ({
                address: string;
                chainId: number;
                id: string;
                userId: string;
                isPrimary: boolean;
                label: string | null;
                createdAt: Date;
            } | {
                address: string;
                chainId: number;
                id: string;
                userId: string;
                isPrimary: boolean;
                label: string | null;
                createdAt: Date;
            })[] | ({
                email: string | null;
                referralCode: string;
                id: string;
                createdAt: Date;
                passwordHash: string | null;
                role: import("@qa-app/database").$Enums.UserRole;
                referredById: string | null;
                agentId: string | null;
                kycStatus: import("@qa-app/database").$Enums.KycStatus;
                kycData: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
            } | {
                email: string | null;
                referralCode: string;
                id: string;
                createdAt: Date;
                passwordHash: string | null;
                role: import("@qa-app/database").$Enums.UserRole;
                referredById: string | null;
                agentId: string | null;
                kycStatus: import("@qa-app/database").$Enums.KycStatus;
                kycData: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
            })[] | ({
                id: string;
                createdAt: Date;
                actorType: string;
                action: string;
                resourceType: string | null;
                resourceId: string | null;
                ipAddress: string | null;
                userAgent: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                actorId: string | null;
            } | {
                id: string;
                createdAt: Date;
                actorType: string;
                action: string;
                resourceType: string | null;
                resourceId: string | null;
                ipAddress: string | null;
                userAgent: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                actorId: string | null;
            })[] | ({
                id: string;
                userId: string;
                createdAt: Date;
                agentId: string | null;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
                usdtAmount: import("@qa-app/database").Decimal;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.OrderStatus;
                referrerId: string | null;
                failureReason: string | null;
                confirmedAt: Date | null;
            } | {
                id: string;
                userId: string;
                createdAt: Date;
                agentId: string | null;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
                usdtAmount: import("@qa-app/database").Decimal;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.OrderStatus;
                referrerId: string | null;
                failureReason: string | null;
                confirmedAt: Date | null;
            })[] | ({
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                isClaimable: boolean;
                periodStart: Date;
                positionId: string;
                amount: import("@qa-app/database").Decimal;
                periodEnd: Date;
                claimedAt: Date | null;
                claimTxHash: string | null;
                merkleIndex: number | null;
                merkleProof: import("@prisma/client/runtime/library").JsonValue | null;
                batchId: string | null;
                distributionTx: string | null;
            } | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                isClaimable: boolean;
                periodStart: Date;
                positionId: string;
                amount: import("@qa-app/database").Decimal;
                periodEnd: Date;
                claimedAt: Date | null;
                claimTxHash: string | null;
                merkleIndex: number | null;
                merkleProof: import("@prisma/client/runtime/library").JsonValue | null;
                batchId: string | null;
                distributionTx: string | null;
            })[] | ({
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                nftTokenId: number | null;
                productId: string;
                status: import("@qa-app/database").$Enums.PositionStatus;
                orderId: string;
                principal: import("@qa-app/database").Decimal;
                startDate: Date;
                endDate: Date;
                nextPayoutAt: Date | null;
                nftTokenUri: string | null;
            } | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                nftTokenId: number | null;
                productId: string;
                status: import("@qa-app/database").$Enums.PositionStatus;
                orderId: string;
                principal: import("@qa-app/database").Decimal;
                startDate: Date;
                endDate: Date;
                nextPayoutAt: Date | null;
                nftTokenUri: string | null;
            })[] | ({
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: import("@qa-app/database").$Enums.CommissionStatus;
                orderId: string;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                basisAmount: import("@qa-app/database").Decimal;
                rateBps: number;
                commissionType: import("@qa-app/database").$Enums.CommissionType;
                settledAt: Date | null;
                settlementTxHash: string | null;
            } | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: import("@qa-app/database").$Enums.CommissionStatus;
                orderId: string;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                basisAmount: import("@qa-app/database").Decimal;
                rateBps: number;
                commissionType: import("@qa-app/database").$Enums.CommissionType;
                settledAt: Date | null;
                settlementTxHash: string | null;
            })[] | ({
                walletAddress: string;
                chainId: number;
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.WithdrawalStatus;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                completedAt: Date | null;
                withdrawalType: import("@qa-app/database").$Enums.WithdrawalType;
                actualAmount: import("@qa-app/database").Decimal;
                blockNumber: number | null;
                gasUsed: number | null;
                gasFee: import("@qa-app/database").Decimal | null;
                riskScore: number;
                riskLevel: import("@qa-app/database").$Enums.RiskLevel;
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
            } | {
                walletAddress: string;
                chainId: number;
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.WithdrawalStatus;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                completedAt: Date | null;
                withdrawalType: import("@qa-app/database").$Enums.WithdrawalType;
                actualAmount: import("@qa-app/database").Decimal;
                blockNumber: number | null;
                gasUsed: number | null;
                gasFee: import("@qa-app/database").Decimal | null;
                riskScore: number;
                riskLevel: import("@qa-app/database").$Enums.RiskLevel;
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
            })[] | ({
                message: string;
                type: string;
                title: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                priority: string;
                channels: import("@prisma/client/runtime/library").JsonValue;
                readAt: Date | null;
                sentAt: Date | null;
                deliveredAt: Date | null;
            } | {
                message: string;
                type: string;
                title: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                priority: string;
                channels: import("@prisma/client/runtime/library").JsonValue;
                readAt: Date | null;
                sentAt: Date | null;
                deliveredAt: Date | null;
            })[] | ({
                message: string;
                level: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                timestamp: Date;
                module: string | null;
            } | {
                message: string;
                level: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                timestamp: Date;
                module: string | null;
            })[] | {
                email: string | null;
                referralCode: string;
                id: string;
                createdAt: Date;
                passwordHash: string | null;
                role: import("@qa-app/database").$Enums.UserRole;
                referredById: string | null;
                agentId: string | null;
                kycStatus: import("@qa-app/database").$Enums.KycStatus;
                kycData: import("@prisma/client/runtime/library").JsonValue | null;
                isActive: boolean;
                lastLoginAt: Date | null;
                updatedAt: Date;
            }[] | {
                id: string;
                createdAt: Date;
                actorType: string;
                action: string;
                resourceType: string | null;
                resourceId: string | null;
                ipAddress: string | null;
                userAgent: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                actorId: string | null;
            }[] | {
                id: string;
                userId: string;
                createdAt: Date;
                agentId: string | null;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                productId: string;
                usdtAmount: import("@qa-app/database").Decimal;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.OrderStatus;
                referrerId: string | null;
                failureReason: string | null;
                confirmedAt: Date | null;
            }[] | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                isClaimable: boolean;
                periodStart: Date;
                positionId: string;
                amount: import("@qa-app/database").Decimal;
                periodEnd: Date;
                claimedAt: Date | null;
                claimTxHash: string | null;
                merkleIndex: number | null;
                merkleProof: import("@prisma/client/runtime/library").JsonValue | null;
                batchId: string | null;
                distributionTx: string | null;
            }[] | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                nftTokenId: number | null;
                productId: string;
                status: import("@qa-app/database").$Enums.PositionStatus;
                orderId: string;
                principal: import("@qa-app/database").Decimal;
                startDate: Date;
                endDate: Date;
                nextPayoutAt: Date | null;
                nftTokenUri: string | null;
            }[] | {
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                status: import("@qa-app/database").$Enums.CommissionStatus;
                orderId: string;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                basisAmount: import("@qa-app/database").Decimal;
                rateBps: number;
                commissionType: import("@qa-app/database").$Enums.CommissionType;
                settledAt: Date | null;
                settlementTxHash: string | null;
            }[] | {
                walletAddress: string;
                chainId: number;
                id: string;
                userId: string;
                createdAt: Date;
                updatedAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                platformFee: import("@qa-app/database").Decimal;
                txHash: string | null;
                status: import("@qa-app/database").$Enums.WithdrawalStatus;
                amount: import("@qa-app/database").Decimal;
                batchId: string | null;
                completedAt: Date | null;
                withdrawalType: import("@qa-app/database").$Enums.WithdrawalType;
                actualAmount: import("@qa-app/database").Decimal;
                blockNumber: number | null;
                gasUsed: number | null;
                gasFee: import("@qa-app/database").Decimal | null;
                riskScore: number;
                riskLevel: import("@qa-app/database").$Enums.RiskLevel;
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
            }[] | {
                message: string;
                type: string;
                title: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                updatedAt: Date;
                data: import("@prisma/client/runtime/library").JsonValue | null;
                status: string;
                priority: string;
                channels: import("@prisma/client/runtime/library").JsonValue;
                readAt: Date | null;
                sentAt: Date | null;
                deliveredAt: Date | null;
            }[] | {
                message: string;
                level: string;
                id: string;
                userId: string | null;
                createdAt: Date;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                timestamp: Date;
                module: string | null;
            }[];
            [x: number]: never;
            [x: symbol]: never;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findTransactions(query: OptimizedTransactionQuery): Promise<{
        data: ({
            id: string;
            type: string;
            amount: import("@qa-app/database").Decimal;
            status: import("@qa-app/database").$Enums.CommissionStatus;
            userEmail: string | null;
            commissionType: import("@qa-app/database").$Enums.CommissionType;
            createdAt: Date;
            completedAt: Date | null;
        } | {
            id: string;
            type: string;
            amount: import("@qa-app/database").Decimal;
            status: import("@qa-app/database").$Enums.WithdrawalStatus;
            userEmail: string | null;
            withdrawalType: import("@qa-app/database").$Enums.WithdrawalType;
            createdAt: Date;
            completedAt: Date | null;
        } | {
            id: string;
            type: string;
            amount: import("@qa-app/database").Decimal;
            status: string;
            userEmail: string | null;
            productInfo: {
                symbol: string;
                name: string;
            };
            createdAt: Date;
            completedAt: Date | null;
        })[];
        total: number;
        offset: number;
        limit: number;
    }>;
    getUserStatistics(timeRange?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        usersByRole: Record<string, number>;
        usersByKyc: Record<string, number>;
        recentRegistrations: number;
        lastUpdated: Date;
    }>;
    getOptimizedAuditLogs(filters?: {
        actorId?: string;
        actions?: string[];
        resourceTypes?: string[];
        startDate?: Date;
        endDate?: Date;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        logs: {
            id: string;
            createdAt: Date;
            action: string;
            resourceType: string | null;
            resourceId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            actor: {
                email: string | null;
                id: string;
                role: import("@qa-app/database").$Enums.UserRole;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getDashboardStats(timeRange?: '1h' | '24h' | '7d' | '30d'): Promise<{
        timeRange: "30d" | "7d" | "1h" | "24h";
        period: {
            startDate: Date;
            endDate: Date;
        };
        users: any;
        orders: any;
        withdrawals: any;
        audit: any;
        lastUpdated: Date;
    }>;
    getUserDashboardData(userId: string): Promise<{
        user: {
            email: string | null;
            referralCode: string;
            id: string;
            createdAt: Date;
            role: import("@qa-app/database").$Enums.UserRole;
            kycStatus: import("@qa-app/database").$Enums.KycStatus;
            wallets: {
                address: string;
                chainId: number;
            }[];
        } | null;
        positions: {
            product: {
                symbol: string;
                name: string;
            };
            id: string;
            principal: import("@qa-app/database").Decimal;
        }[];
        recentOrders: {
            product: {
                symbol: string;
                name: string;
            };
            id: string;
            createdAt: Date;
            usdtAmount: import("@qa-app/database").Decimal;
            status: import("@qa-app/database").$Enums.OrderStatus;
        }[];
        pendingWithdrawals: {
            id: string;
            status: import("@qa-app/database").$Enums.WithdrawalStatus;
            amount: import("@qa-app/database").Decimal;
            requestedAt: Date;
        }[];
        totalBalance: number;
        totalEarnings: number;
        lastUpdated: Date;
    }>;
    getAdminAnalytics(startDate?: Date, endDate?: Date): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
        totalRevenue: number;
        pendingRevenue: number;
        withdrawalStats: any;
        systemHealth: any;
        period: {
            startDate: Date | undefined;
            endDate: Date | undefined;
        };
        lastUpdated: Date;
    }>;
    getUserPositions(userId: string, page?: number, limit?: number): Promise<{
        positions: {
            product: {
                symbol: string;
                name: string;
                id: string;
                minAmount: import("@qa-app/database").Decimal;
            };
            id: string;
            createdAt: Date;
            payouts: {
                id: string;
                isClaimable: boolean;
                amount: import("@qa-app/database").Decimal;
                claimedAt: Date | null;
            }[];
            status: import("@qa-app/database").$Enums.PositionStatus;
            principal: import("@qa-app/database").Decimal;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    performMaintenance(): Promise<{
        status: string;
        operations: Array<{
            name: string;
            success: boolean;
            duration: number;
        }>;
        summary: string;
    }>;
}
