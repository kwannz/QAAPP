import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, Web3LoginDto, Web3RegisterDto, ChangePasswordDto, ForgotPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResult, Web3Challenge, RefreshResult } from './interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, ip: string, userAgent: string): Promise<AuthResult>;
    login(loginDto: LoginDto, ip: string, userAgent: string): Promise<AuthResult>;
    getWeb3Challenge(address: string): Promise<Web3Challenge>;
    web3Register(web3RegisterDto: Web3RegisterDto, ip: string, userAgent: string): Promise<AuthResult>;
    web3Login(web3LoginDto: Web3LoginDto, ip: string, userAgent: string): Promise<AuthResult>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshResult>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    validateToken(): Promise<{
        message: string;
        valid: boolean;
    }>;
}
