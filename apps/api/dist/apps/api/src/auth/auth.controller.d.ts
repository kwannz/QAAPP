import { AuthenticatedRequest } from '../common/types/express.types';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, WalletChallengeDto, WalletVerifyDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    generateWalletChallenge(challengeDto: WalletChallengeDto): Promise<{
        message: string;
        expiresAt: string;
    }>;
    verifyWalletSignature(verifyDto: WalletVerifyDto): Promise<AuthResponseDto>;
    googleLogin(body: {
        token: string;
    }): Promise<AuthResponseDto>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    getProfile(req: AuthenticatedRequest): Promise<import("../common/types/express.types").AuthenticatedUser>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        activeChallenges: number;
    }>;
    private getActiveChallengeCount;
}
