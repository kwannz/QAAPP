import { UserRole, KycStatus } from '@qa-app/database';
export interface JwtPayload {
    sub: string;
    email?: string;
    role: UserRole;
    kycStatus: KycStatus;
    iat?: number;
    exp?: number;
}
export interface AuthResult {
    user: {
        id: string;
        email?: string;
        role: UserRole;
        kycStatus: KycStatus;
        referralCode: string;
        isActive: boolean;
        wallets?: Array<{
            address: string;
            chainId: number;
            isPrimary: boolean;
            label?: string;
        }>;
        agent?: {
            id: string;
            referralCode: string;
        };
        createdAt: Date;
        updatedAt: Date;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface Web3Challenge {
    challenge: string;
    expiresAt: Date;
}
export interface RefreshResult {
    accessToken: string;
    expiresIn: number;
}
export interface CurrentUser {
    id: string;
    email?: string;
    role: UserRole;
    kycStatus: KycStatus;
    referralCode: string;
    isActive: boolean;
    wallets?: Array<{
        id: string;
        address: string;
        chainId: number;
        isPrimary: boolean;
        label?: string;
    }>;
    agent?: {
        id: string;
        referralCode: string;
    };
    positions?: Array<{
        id: string;
        productId: string;
        principal: number;
        status: string;
        endDate: Date;
    }>;
}
export interface PermissionCheck {
    resource: string;
    action: string;
    resourceId?: string;
    conditions?: Record<string, any>;
}
export interface LoginHistory {
    id: string;
    userId: string;
    loginMethod: 'email' | 'web3';
    ipAddress: string;
    userAgent: string;
    location?: string;
    loginAt: Date;
    success: boolean;
    failureReason?: string;
}
export interface SecurityEvent {
    id: string;
    userId: string;
    eventType: 'LOGIN_FAILURE' | 'PASSWORD_CHANGE' | 'SUSPICIOUS_ACTIVITY' | 'TOKEN_REFRESH' | 'LOGOUT';
    ipAddress: string;
    userAgent: string;
    metadata: Record<string, any>;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: Date;
}
export interface TokenBlacklist {
    token: string;
    userId: string;
    reason: 'LOGOUT' | 'PASSWORD_CHANGE' | 'SECURITY_BREACH' | 'ADMIN_REVOKE';
    expiresAt: Date;
    createdAt: Date;
}
export interface UserSession {
    id: string;
    userId: string;
    sessionToken: string;
    deviceInfo: {
        userAgent: string;
        os?: string;
        browser?: string;
        device?: string;
    };
    location?: {
        ip: string;
        country?: string;
        city?: string;
    };
    isActive: boolean;
    lastActivity: Date;
    expiresAt: Date;
    createdAt: Date;
}
export interface TwoFactorAuth {
    userId: string;
    method: 'TOTP' | 'SMS' | 'EMAIL';
    secret?: string;
    phoneNumber?: string;
    email?: string;
    isEnabled: boolean;
    backupCodes: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiKey {
    id: string;
    userId: string;
    name: string;
    keyHash: string;
    permissions: string[];
    rateLimit: number;
    isActive: boolean;
    lastUsed?: Date;
    expiresAt?: Date;
    createdAt: Date;
}
