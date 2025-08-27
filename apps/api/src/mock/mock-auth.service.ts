import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface MockUser {
  id: string;
  email?: string;
  passwordHash?: string;
  role: 'USER' | 'ADMIN' | 'AGENT';
  referralCode: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  wallets: Array<{
    id: string;
    address: string;
    chainId: number;
    isPrimary: boolean;
    label?: string;
  }>;
}

@Injectable()
export class MockAuthService {
  private readonly logger = new Logger(MockAuthService.name);
  private users: Map<string, MockUser> = new Map();
  private usersByEmail: Map<string, MockUser> = new Map();
  private usersByWallet: Map<string, MockUser> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.initializeTestUsers();
  }

  private initializeTestUsers() {
    // 创建测试用户
    const testUsers: MockUser[] = [
      {
        id: 'user-test-001',
        email: 'test@qaapp.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfCAquAAv2Br6nu', // password: 'password123'
        role: 'USER',
        referralCode: 'TEST001',
        kycStatus: 'APPROVED',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        wallets: [
          {
            id: 'wallet-test-001',
            address: '0x742d35cC6C5A8b28c2b230B7c2E7e5E5B8F9E8C3',
            chainId: 1,
            isPrimary: true,
            label: 'Primary Wallet'
          }
        ]
      },
      {
        id: 'user-admin-001',
        email: 'admin@qaapp.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfCAquAAv2Br6nu', // password: 'password123'
        role: 'ADMIN',
        referralCode: 'ADMIN001',
        kycStatus: 'APPROVED',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        wallets: []
      }
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
      if (user.email) {
        this.usersByEmail.set(user.email.toLowerCase(), user);
      }
      user.wallets.forEach(wallet => {
        this.usersByWallet.set(wallet.address.toLowerCase(), user);
      });
    });

    this.logger.log(`🔄 Mock Auth Service initialized with ${testUsers.length} test users`);
  }

  async login(loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;
    const user = this.usersByEmail.get(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 在实际应用中会验证密码哈希
    // 这里为了演示简化处理
    if (password !== 'password123') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();

    this.logger.log(`User logged in via email: ${user.email}`);
    return this.generateTokenResponse(user);
  }

  async register(registerDto: { email: string; password: string; referralCode?: string; walletAddress?: string }) {
    const { email, password, referralCode, walletAddress } = registerDto;
    if (this.usersByEmail.has(email.toLowerCase())) {
      throw new BadRequestException('Email already registered');
    }

    if (walletAddress && this.usersByWallet.has(walletAddress.toLowerCase())) {
      throw new BadRequestException('Wallet address already registered');
    }

    // 创建新用户
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const userReferralCode = 'REF' + id.substr(-6).toUpperCase();

    const user: MockUser = {
      id,
      email: email.toLowerCase(),
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfCAquAAv2Br6nu', // hashed password
      role: 'USER',
      referralCode: userReferralCode,
      kycStatus: 'PENDING',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      wallets: []
    };

    // 如果提供了钱包地址，添加钱包
    if (walletAddress) {
      const walletId = 'wallet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      user.wallets.push({
        id: walletId,
        address: walletAddress.toLowerCase(),
        chainId: 1,
        isPrimary: true,
        label: 'Primary Wallet'
      });
      this.usersByWallet.set(walletAddress.toLowerCase(), user);
    }

    // 保存用户
    this.users.set(id, user);
    this.usersByEmail.set(email.toLowerCase(), user);

    this.logger.log(`New user registered: ${user.email} (${user.referralCode})`);
    return this.generateTokenResponse(user);
  }

  async generateWalletChallenge(challengeDto: { address: string; chainId?: number }) {
    const { address } = challengeDto;
    const nonce = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().toISOString();
    
    const message = `Please sign this message to authenticate with QA App.

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger any blockchain transaction or cost any gas fees.`;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟过期

    this.logger.debug(`Generated wallet challenge for ${address}`);

    return {
      message,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async googleLogin(googleToken: string) {
    // 在实际实现中会验证Google ID Token
    // 这里为了演示简化处理
    if (!googleToken || googleToken.length < 10) {
      throw new UnauthorizedException('Invalid Google token');
    }

    // 模拟解析Google Token获取用户信息
    const mockGoogleUser = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: 'user@gmail.com', // 实际中从Google Token解析
      name: 'Google User',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      email_verified: true,
    };

    // 查找或创建用户
    let user = this.usersByEmail.get(mockGoogleUser.email.toLowerCase());
    
    if (!user) {
      // 创建新用户（Google优先注册）
      const id = 'user-google-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const userReferralCode = 'GOOGLE' + id.substr(-6).toUpperCase();

      user = {
        id,
        email: mockGoogleUser.email.toLowerCase(),
        role: 'USER',
        referralCode: userReferralCode,
        kycStatus: 'PENDING',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        wallets: []
      };

      this.users.set(user.id, user);
      this.usersByEmail.set(mockGoogleUser.email.toLowerCase(), user);

      this.logger.log(`New user created via Google: ${mockGoogleUser.email} (${user.referralCode})`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();

    this.logger.log(`User logged in via Google: ${mockGoogleUser.email}`);
    return this.generateTokenResponse(user);
  }

  async verifyWalletSignature(verifyDto: { address: string; signature: string; message: string }) {
    const { address, signature, message } = verifyDto;
    // 在实际实现中会验证签名
    // 这里为了演示简化处理
    if (!signature || signature.length < 10) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // 查找用户
    let user = this.usersByWallet.get(address.toLowerCase());

    if (!user) {
      // 创建新用户（钱包优先注册）
      const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const userReferralCode = 'REF' + id.substr(-6).toUpperCase();

      user = {
        id,
        role: 'USER',
        referralCode: userReferralCode,
        kycStatus: 'PENDING',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        wallets: [
          {
            id: 'wallet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            address: address.toLowerCase(),
            chainId: 1,
            isPrimary: true,
            label: 'Primary Wallet'
          }
        ]
      };

      this.users.set(user.id, user);
      this.usersByWallet.set(address.toLowerCase(), user);

      this.logger.log(`New user created via wallet: ${address} (${user.referralCode})`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();

    this.logger.log(`User logged in via wallet: ${address}`);
    return this.generateTokenResponse(user);
  }

  async refreshToken(refreshDto: { refreshToken: string }) {
    const { refreshToken } = refreshDto;
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      const user = this.users.get(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokenResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async getUserById(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null;
  }

  private async generateTokenResponse(user: MockUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.wallets?.[0]?.address,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
        expiresIn: '30d',
      },
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天后

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.wallets?.[0]?.address,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        wallets: user.wallets,
      },
      expiresAt: expiresAt.toISOString(),
    };
  }
}