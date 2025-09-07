export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    referralCode?: string;
    walletAddress?: string;
}
export declare class WalletChallengeDto {
    address: string;
    chainId: number;
}
export declare class WalletVerifyDto {
    address: string;
    signature: string;
    message: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email?: string;
        role: string;
        walletAddress?: string;
        kycStatus: string;
    };
    expiresAt: string;
}
