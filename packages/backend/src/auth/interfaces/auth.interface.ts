import { UserRole, KycStatus } from '@qa-app/database';

// JWT载荷接口
export interface JwtPayload {
  sub: string; // 用户ID
  email?: string; // 邮箱（Web3用户可能没有）
  role: UserRole; // 用户角色
  kycStatus: KycStatus; // KYC状态
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}

// 认证结果接口
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
  expiresIn: number; // 秒
}

// Web3挑战接口
export interface Web3Challenge {
  challenge: string;
  expiresAt: Date;
}

// 刷新令牌结果接口
export interface RefreshResult {
  accessToken: string;
  expiresIn: number;
}

// 当前用户接口（用于请求上下文）
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

// 权限检查接口
export interface PermissionCheck {
  resource: string; // 资源类型，如 'user', 'order', 'position'
  action: string; // 操作类型，如 'read', 'write', 'delete'
  resourceId?: string; // 具体资源ID
  conditions?: Record<string, any>; // 额外条件
}

// 登录历史接口
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

// 安全事件接口
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

// 令牌黑名单接口
export interface TokenBlacklist {
  token: string;
  userId: string;
  reason: 'LOGOUT' | 'PASSWORD_CHANGE' | 'SECURITY_BREACH' | 'ADMIN_REVOKE';
  expiresAt: Date;
  createdAt: Date;
}

// 会话管理接口
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

// 双因素认证接口
export interface TwoFactorAuth {
  userId: string;
  method: 'TOTP' | 'SMS' | 'EMAIL';
  secret?: string; // TOTP密钥
  phoneNumber?: string; // SMS手机号
  email?: string; // 邮箱
  isEnabled: boolean;
  backupCodes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API密钥接口（用于程序化访问）
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string; // 哈希后的密钥
  permissions: string[]; // 权限列表
  rateLimit: number; // 每分钟请求限制
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
}