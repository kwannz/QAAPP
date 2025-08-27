import { UserRole, KycStatus } from '@qa-app/database';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/interfaces/auth.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(user: CurrentUser): Promise<any>;
    updateCurrentUser(userId: string, updateData: any): Promise<any>;
    getCurrentUserStats(userId: string): Promise<any>;
    getMyReferrals(userId: string, page?: number, limit?: number): Promise<any>;
    addWallet(userId: string, walletData: {
        chainId: number;
        address: string;
        isPrimary?: boolean;
        label?: string;
    }): Promise<any>;
    removeWallet(userId: string, walletId: string): Promise<any>;
    setPrimaryWallet(userId: string, walletId: string): Promise<any>;
    getUsers(page?: number, limit?: number, role?: UserRole, kycStatus?: KycStatus, isActive?: boolean, search?: string): Promise<any>;
    getUser(id: string): Promise<any>;
    updateUser(id: string, updateData: any): Promise<any>;
    updateKycStatus(id: string, data: {
        kycStatus: KycStatus;
        kycData?: any;
    }): Promise<any>;
    toggleUserStatus(id: string, data: {
        isActive: boolean;
    }): Promise<any>;
    getUserReferrals(id: string, page?: number, limit?: number): Promise<any>;
    deleteUser(id: string): Promise<any>;
}
