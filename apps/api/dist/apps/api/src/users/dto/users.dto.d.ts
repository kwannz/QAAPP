import { UserRole, KycStatus } from '@qa-app/database';
export declare class UpdateUserProfileDto {
    email?: string;
    password?: string;
}
export declare class AddWalletDto {
    address: string;
    chainId: number;
    label?: string;
    isPrimary?: boolean;
}
export declare class UpdateKycStatusDto {
    kycStatus: KycStatus;
    kycData?: any;
}
export declare class UpdateUserRoleDto {
    role: UserRole;
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    email?: string;
    role?: UserRole;
    kycStatus?: KycStatus;
    referralCode?: string;
    isActive?: boolean;
}
export declare class UserStatsDto {
    startDate?: string;
    endDate?: string;
}
export declare class UserResponseDto {
    id: string;
    email?: string;
    role: UserRole;
    referralCode: string;
    kycStatus: KycStatus;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt?: Date;
    wallets: Array<{
        id: string;
        address: string;
        chainId: number;
        isPrimary: boolean;
        label?: string;
    }>;
    referredBy?: {
        id: string;
        referralCode: string;
        email?: string;
    };
    agent?: {
        id: string;
        referralCode: string;
        email?: string;
    };
}
export declare class UserStatsResponseDto {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
    usersByKycStatus: Record<string, number>;
}
