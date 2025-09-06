import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { DatabaseService } from '../database/database.service';
import { WalletSignatureService } from './services/wallet-signature.service';
import { LoginDto, RegisterDto, WalletChallengeDto, WalletVerifyDto, RefreshTokenDto, AuthResponseDto } from './dto/auth.dto';
import { UserData, CreateAuditLogParams } from './interfaces/user.interface';
import { UserRole, KycStatus, Prisma } from '@qa-app/database';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private database: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private walletSignatureService: WalletSignatureService,
  ) {}

  /**
   * 邮箱密码登录
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.database.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 验证密码
    if (!user.passwordHash) {
      throw new UnauthorizedException('Account has no password set');
    }
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 更新最后登录时间
    await this.database.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 记录登录日志
    await this.createAuditLog(user.id, 'EMAIL_LOGIN', 'AUTH', null, {
      email: user.email,
      loginMethod: 'email',
    });

    this.logger.log(`User logged in via email: ${user.email}`);

    const userData = this.mapDatabaseUserToUserData(user);
    return this.generateTokenResponse(userData);
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, referralCode, walletAddress } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.database.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Registration failed. Please check your information.');
    }

    // 验证推荐码（如果提供）
    let referrer = null;
    if (referralCode) {
      referrer = await this.database.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
    }

    // 检查钱包地址是否已被使用
    if (walletAddress) {
      const existingWallet = await this.database.wallet.findFirst({
        where: { address: walletAddress.toLowerCase() },
      });

      if (existingWallet) {
        throw new BadRequestException('Registration failed. Please check your information.');
      }
    }

    // 创建用户
    const hashedPassword = await hash(password, 12);
    const userReferralCode = await this.generateUniqueReferralCode();

    const user = await this.database.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: UserRole.USER,
        referralCode: userReferralCode,
        referredById: referrer?.id,
        agentId: referrer?.agentId || referrer?.id,
        kycStatus: KycStatus.PENDING,
        isActive: true,
      },
      include: {
        wallets: true,
      },
    });

    // 如果提供了钱包地址，创建钱包记录
    if (walletAddress) {
      await this.database.wallet.create({
        data: {
          userId: user.id,
          chainId: 1, // 默认以太坊主网
          address: walletAddress.toLowerCase(),
          isPrimary: true,
          label: 'Primary Wallet',
        },
      });
    }

    // 记录注册日志
    await this.createAuditLog(user.id, 'USER_REGISTER', 'USER', user.id, {
      email: user.email,
      referralCode: userReferralCode,
      referredBy: referrer?.referralCode,
      registrationMethod: walletAddress ? 'email_wallet' : 'email',
    });

    this.logger.log(`New user registered: ${user.email} (${user.referralCode})`);

    const userData = this.mapDatabaseUserToUserData(user);
    return this.generateTokenResponse(userData);
  }

  /**
   * 生成钱包签名挑战
   */
  async generateWalletChallenge(challengeDto: WalletChallengeDto) {
    const { address, chainId } = challengeDto;

    // 验证链ID是否支持
    const supportedChains = [1, 11155111]; // 主网和Sepolia测试网
    if (!supportedChains.includes(chainId)) {
      throw new BadRequestException('Unsupported chain ID');
    }

    const challenge = this.walletSignatureService.generateChallenge(address);

    this.logger.debug(`Generated wallet challenge for ${address} on chain ${chainId}`);

    return {
      message: challenge.message,
      expiresAt: challenge.expiresAt.toISOString(),
    };
  }

  /**
   * 验证钱包签名并登录
   */
  async verifyWalletSignature(verifyDto: WalletVerifyDto): Promise<AuthResponseDto> {
    const { address, signature, message } = verifyDto;

    // 验证签名
    const isValid = await this.walletSignatureService.verifySignature(
      address,
      signature,
      message,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid wallet signature');
    }

    // 查找或创建用户
    let user = await this.database.user.findFirst({
      where: {
        wallets: {
          some: {
            address: address.toLowerCase(),
          },
        },
      },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      // 创建新用户（钱包优先注册）
      const userReferralCode = await this.generateUniqueReferralCode();

      user = await this.database.user.create({
        data: {
          role: UserRole.USER,
          referralCode: userReferralCode,
          kycStatus: KycStatus.PENDING,
          isActive: true,
          wallets: {
            create: {
              chainId: 1, // 默认主网
              address: address.toLowerCase(),
              isPrimary: true,
              label: 'Primary Wallet',
            },
          },
        },
        include: {
          wallets: true,
        },
      });

      this.logger.log(`New user created via wallet: ${address} (${user.referralCode})`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 更新最后登录时间
    await this.database.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 记录登录日志
    await this.createAuditLog(user.id, 'WALLET_LOGIN', 'AUTH', null, {
      walletAddress: address,
      loginMethod: 'wallet',
    });

    this.logger.log(`User logged in via wallet: ${address}`);

    const userData = this.mapDatabaseUserToUserData(user);
    return this.generateTokenResponse(userData);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new UnauthorizedException('JWT refresh secret not configured');
      }
      
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.database.user.findUnique({
        where: { id: payload.sub },
        include: { wallets: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userData = this.mapDatabaseUserToUserData(user);
      return this.generateTokenResponse(userData);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * 登出
   */
  async logout(userId: string): Promise<{ message: string }> {
    // 记录登出日志
    await this.createAuditLog(userId, 'USER_LOGOUT', 'AUTH', null, {
      logoutTime: new Date().toISOString(),
    });

    this.logger.log(`User logged out: ${userId}`);

    return { message: 'Logged out successfully' };
  }

  /**
   * 生成令牌响应
   */
  private async generateTokenResponse(user: UserData): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.wallets?.[0]?.address,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }
    
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: refreshSecret,
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
      },
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * 生成唯一推荐码
   */
  private async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string;
    let isUnique = false;

    do {
      // 生成8位随机字符串
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // 检查是否唯一
      const existing = await this.database.user.findUnique({
        where: { referralCode },
      });

      isUnique = !existing;
    } while (!isUnique);

    return referralCode;
  }

  /**
   * Google登录
   */
  async googleLogin(googleToken: string): Promise<AuthResponseDto> {
    if (!googleToken || googleToken.length < 10) {
      throw new UnauthorizedException('Invalid Google token');
    }

    // 验证Google ID Token
    let googleUser: any;
    try {
      const client = new OAuth2Client();
      
      // 验证ID token
      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      
      const payload = ticket.getPayload();
      if (!payload || !payload.email_verified) {
        throw new UnauthorizedException('Google token verification failed');
      }
      
      googleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }

    // 查找或创建用户
    let user = await this.database.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: { wallets: true },
    });
    
    if (!user) {
      // 创建新用户（Google优先注册）
      const userReferralCode = await this.generateUniqueReferralCode();

      user = await this.database.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          role: UserRole.USER,
          referralCode: userReferralCode,
          kycStatus: KycStatus.PENDING,
          isActive: true,
        },
        include: { wallets: true },
      });

      this.logger.log(`New user created via Google: ${googleUser.email} (${user.referralCode})`);
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // 更新最后登录时间
    await this.database.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 记录登录日志
    await this.createAuditLog(user.id, 'GOOGLE_LOGIN', 'AUTH', null, {
      email: googleUser.email,
      loginMethod: 'google',
    });

    this.logger.log(`User logged in via Google: ${googleUser.email}`);
    const userData = this.mapDatabaseUserToUserData(user);
    return this.generateTokenResponse(userData);
  }

  /**
   * 根据ID获取用户信息（JWT策略使用）
   */
  async getUserById(userId: string) {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      isActive: user.isActive,
      wallets: user.wallets,
    };
  }

  /**
   * 创建审计日志
   */
  private async createAuditLog(
    actorId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.database.auditLog.create({
        data: {
          actorId,
          actorType: 'USER',
          action,
          resourceType,
          resourceId,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * 将数据库用户对象映射为UserData接口
   */
  private mapDatabaseUserToUserData(user: any): UserData {
    return {
      id: user.id,
      email: user.email ?? undefined,
      role: user.role,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      isActive: user.isActive,
      wallets: user.wallets || [],
      agentId: user.agentId ?? undefined,
      referredById: user.referredById ?? undefined,
      lastLoginAt: user.lastLoginAt ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}