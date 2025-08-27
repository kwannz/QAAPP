import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, Web3LoginDto, Web3RegisterDto, ChangePasswordDto, ForgotPasswordDto } from './dto/auth.dto';
import { AuthResult } from './interfaces/auth.interface';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private auditService;
    private readonly web3Challenges;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, auditService: AuditService);
    register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    getWeb3Challenge(address: string): Promise<{
        challenge: string;
        expiresAt: Date;
    }>;
    web3Register(web3RegisterDto: Web3RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    web3Login(web3LoginDto: Web3LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResult>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    validateToken(token: string): Promise<any>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    logout(userId: string, token: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private generateAccessToken;
    private getTokenExpiresIn;
    private generateChallenge;
    private verifyWeb3Signature;
    private generateUniqueReferralCode;
    private cleanExpiredChallenges;
    private sanitizeUser;
}
