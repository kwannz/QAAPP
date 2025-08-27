import { Prisma, UserRole, KycStatus } from '@qa-app/database';
import { PaginationOptions, PaginatedResult } from '@qa-app/database';
export declare class UsersService {
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    findByReferralCode(referralCode: string): Promise<any>;
    findByWalletAddress(address: string): Promise<any>;
    findMany(options: PaginationOptions & {
        role?: UserRole;
        kycStatus?: KycStatus;
        isActive?: boolean;
        search?: string;
    }): Promise<PaginatedResult<any>>;
    create(userData: Prisma.UserCreateInput): Promise<any>;
    update(id: string, updateData: Prisma.UserUpdateInput): Promise<any>;
    updateLastLogin(id: string): Promise<any>;
    updatePassword(id: string, passwordHash: string): Promise<any>;
    updateKycStatus(id: string, kycStatus: KycStatus, kycData?: any): Promise<any>;
    addWallet(userId: string, walletData: {
        chainId: number;
        address: string;
        isPrimary?: boolean;
        label?: string;
    }): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        chainId: number;
        address: string;
        isPrimary: boolean;
        label: string | null;
    }>;
    removeWallet(userId: string, walletId: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        chainId: number;
        address: string;
        isPrimary: boolean;
        label: string | null;
    }>;
    setPrimaryWallet(userId: string, walletId: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        chainId: number;
        address: string;
        isPrimary: boolean;
        label: string | null;
    }>;
    getUserStats(userId: string): Promise<{
        order: {
            count: number;
            totalAmount: number;
        };
        position: {
            count: number;
            totalPrincipal: number;
        };
        commission: {
            count: number;
            totalAmount: number;
        };
        claimablePayouts: {
            count: number;
            totalAmount: number;
        };
    }>;
    getReferrals(userId: string, options: PaginationOptions): Promise<any>;
    toggleUserStatus(id: string, isActive: boolean): Promise<any>;
    softDelete(id: string): Promise<any>;
}
