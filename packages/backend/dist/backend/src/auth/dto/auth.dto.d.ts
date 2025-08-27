export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    referralCode?: string;
}
export declare class Web3LoginDto {
    address: string;
    signature: string;
}
export declare class Web3RegisterDto {
    address: string;
    signature: string;
    referralCode?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    resetToken: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
