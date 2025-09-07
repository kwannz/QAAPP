import { DatabaseService } from '../database/database.service';
import { PerformanceOptimizerService } from '../common/performance/performance-optimizer.service';
import { UpdateUserProfileDto, AddWalletDto, UpdateKycStatusDto, UpdateUserRoleDto, UserQueryDto, UserStatsDto, UserResponseDto, UserStatsResponseDto } from './dto/users.dto';
export declare class UsersService {
    private database;
    private performanceOptimizer;
    private readonly logger;
    constructor(database: DatabaseService, performanceOptimizer: PerformanceOptimizerService);
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    findByReferralCode(referralCode: string): Promise<any>;
    findAll(queryDto: UserQueryDto): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateProfile(userId: string, updateDto: UpdateUserProfileDto): Promise<UserResponseDto>;
    addWallet(userId: string, walletDto: AddWalletDto): Promise<any>;
    removeWallet(userId: string, walletId: string): Promise<{
        message: string;
    }>;
    updateKycStatus(userId: string, kycDto: UpdateKycStatusDto, adminId: string): Promise<UserResponseDto>;
    updateUserRole(userId: string, roleDto: UpdateUserRoleDto, adminId: string): Promise<UserResponseDto>;
    toggleUserStatus(userId: string, adminId: string): Promise<UserResponseDto>;
    getUserStats(statsDto: UserStatsDto): Promise<UserStatsResponseDto>;
    private createAuditLog;
    private mapDatabaseUserToResponseDto;
}
