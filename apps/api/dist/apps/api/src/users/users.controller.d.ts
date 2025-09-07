import { UsersService } from './users.service';
import { UpdateUserProfileDto, AddWalletDto, UpdateKycStatusDto, UpdateUserRoleDto, UserQueryDto, UserStatsDto, UserResponseDto, UserStatsResponseDto } from './dto/users.dto';
import { AuthenticatedRequest } from '../common/types/express.types';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<UserResponseDto>;
    updateProfile(req: AuthenticatedRequest, updateDto: UpdateUserProfileDto): Promise<UserResponseDto>;
    getMyWallets(req: AuthenticatedRequest): Promise<any>;
    addWallet(req: AuthenticatedRequest, walletDto: AddWalletDto): Promise<any>;
    removeWallet(req: AuthenticatedRequest, walletId: string): Promise<{
        message: string;
    }>;
    getUserByReferralCode(code: string): Promise<any>;
    getAllUsers(queryDto: UserQueryDto): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUserById(id: string): Promise<UserResponseDto>;
    updateKycStatus(id: string, kycDto: UpdateKycStatusDto, req: AuthenticatedRequest): Promise<UserResponseDto>;
    updateUserRole(id: string, roleDto: UpdateUserRoleDto, req: AuthenticatedRequest): Promise<UserResponseDto>;
    toggleUserStatus(id: string, req: AuthenticatedRequest): Promise<UserResponseDto>;
    getUserStats(statsDto: UserStatsDto): Promise<UserStatsResponseDto>;
}
