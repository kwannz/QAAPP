import { UserRole, KycStatus, Wallet } from '@qa-app/database';
export interface UserData {
    id: string;
    email?: string;
    role: UserRole;
    kycStatus: KycStatus;
    referralCode: string;
    isActive: boolean;
    wallets: Wallet[];
    agentId?: string;
    referredById?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAuditLogParams {
    actorId: string;
    actorType: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    metadata: Record<string, unknown>;
}
export interface AuthTokenPayload {
    sub: string;
    email?: string;
    role: UserRole;
    walletAddress?: string;
    iat?: number;
    exp?: number;
}
