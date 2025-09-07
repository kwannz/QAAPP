import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { WalletSignatureService } from './services/wallet-signature.service';
import { LoginDto, RegisterDto, WalletChallengeDto, WalletVerifyDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private database;
    private jwtService;
    private configService;
    private walletSignatureService;
    private readonly logger;
    constructor(database: DatabaseService, jwtService: JwtService, configService: ConfigService, walletSignatureService: WalletSignatureService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    generateWalletChallenge(challengeDto: WalletChallengeDto): Promise<{
        message: string;
        expiresAt: string;
    }>;
    verifyWalletSignature(verifyDto: WalletVerifyDto): Promise<AuthResponseDto>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokenResponse;
    private generateUniqueReferralCode;
    googleLogin(googleToken: string): Promise<AuthResponseDto>;
    getUserById(userId: string): Promise<{
        id: string;
        email: string | null;
        role: import("@qa-app/database").$Enums.UserRole;
        kycStatus: import("@qa-app/database").$Enums.KycStatus;
        referralCode: string;
        isActive: boolean;
        wallets: {
            address: string;
            chainId: number;
            id: string;
            userId: string;
            isPrimary: boolean;
            label: string | null;
            createdAt: Date;
        }[];
    } | null>;
    private createAuditLog;
    private mapDatabaseUserToUserData;
}
