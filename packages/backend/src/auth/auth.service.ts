import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import { UsersService } from '../users/users.service';
import { prisma, validateEmail, validatePassword, validateWalletAddress } from '@qa-app/database';
import { UserRole, KycStatus } from '@qa-app/database';

import { 
  LoginDto, 
  RegisterDto, 
  Web3LoginDto, 
  Web3RegisterDto, 
  ChangePasswordDto, 
  ForgotPasswordDto,
  ResetPasswordDto 
} from './dto/auth.dto';
import { JwtPayload, AuthResult, Web3Challenge } from './interfaces/auth.interface';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  private readonly web3Challenges = new Map<string, Web3Challenge>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    // 清理过期的Web3挑战，每30分钟执行一次
    setInterval(() => {
      this.cleanExpiredChallenges();
    }, 30 * 60 * 1000);
  }

  // 传统邮箱密码注册
  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const { email, password, referralCode } = registerDto;

    // 验证输入数据
    if (!validateEmail(email)) {
      throw new BadRequestException('邮箱格式无效');
    }

    if (!validatePassword(password)) {
      throw new BadRequestException('密码必须至少8位，包含大小写字母、数字和特殊字符');
    }

    // 检查邮箱是否已存在
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('邮箱已被注册');
    }

    // 验证推荐码（如果提供）
    let referrer = null;
    let agent = null;
    
    if (referralCode) {
      referrer = await this.usersService.findByReferralCode(referralCode);
      if (!referrer) {
        throw new BadRequestException('推荐码无效');
      }
      
      // 如果推荐人是代理，则直接设置为代理
      if (referrer.role === UserRole.AGENT) {
        agent = referrer;
      } else {
        // 否则查找推荐人的代理
        agent = referrer.agent ? referrer.agent : null;
      }
    }

    // 生成唯一的推荐码
    const newReferralCode = await this.generateUniqueReferralCode();
    
    // 密码哈希
    const passwordHash = await hash(password, 12);

    // 创建用户
    const user = await this.usersService.create({
      email,
      passwordHash,
      role: UserRole.USER,
      referralCode: newReferralCode,
      referredBy: referrer ? { connect: { id: referrer.id } } : undefined,
      agent: agent ? { connect: { id: agent.id } } : undefined,
      kycStatus: KycStatus.PENDING,
      isActive: true,
    });

    // 记录审计日志
    await this.auditService.log({
      actorId: user.id,
      actorType: 'USER',
      action: 'USER_REGISTER',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        email,
        registrationMethod: 'email',
        referrerCode: referralCode,
      },
    });

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 传统邮箱密码登录
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用');
    }

    // 更新最后登录时间
    await this.usersService.updateLastLogin(user.id);

    // 记录审计日志
    await this.auditService.log({
      actorId: user.id,
      actorType: 'USER',
      action: 'USER_LOGIN',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        email,
        loginMethod: 'email',
      },
    });

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 获取Web3登录挑战
  async getWeb3Challenge(address: string): Promise<{ challenge: string; expiresAt: Date }> {
    if (!validateWalletAddress(address)) {
      throw new BadRequestException('钱包地址格式无效');
    }

    // 生成随机挑战字符串
    const challenge = this.generateChallenge();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟过期

    // 存储挑战
    this.web3Challenges.set(address.toLowerCase(), {
      challenge,
      expiresAt,
    });

    return { challenge, expiresAt };
  }

  // Web3钱包注册
  async web3Register(web3RegisterDto: Web3RegisterDto, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const { address, signature, referralCode } = web3RegisterDto;

    // 验证签名
    const challenge = this.web3Challenges.get(address.toLowerCase());
    if (!challenge) {
      throw new BadRequestException('请先获取签名挑战');
    }

    if (new Date() > challenge.expiresAt) {
      this.web3Challenges.delete(address.toLowerCase());
      throw new BadRequestException('签名挑战已过期，请重新获取');
    }

    // 验证签名
    const isSignatureValid = this.verifyWeb3Signature(address, challenge.challenge, signature);
    if (!isSignatureValid) {
      throw new UnauthorizedException('签名验证失败');
    }

    // 清理使用过的挑战
    this.web3Challenges.delete(address.toLowerCase());

    // 检查钱包地址是否已注册
    const existingWallet = await this.usersService.findByWalletAddress(address);
    if (existingWallet) {
      throw new ConflictException('该钱包地址已被注册');
    }

    // 验证推荐码（如果提供）
    let referrer = null;
    let agent = null;
    
    if (referralCode) {
      referrer = await this.usersService.findByReferralCode(referralCode);
      if (!referrer) {
        throw new BadRequestException('推荐码无效');
      }
      
      if (referrer.role === UserRole.AGENT) {
        agent = referrer;
      } else {
        agent = referrer.agent ? referrer.agent : null;
      }
    }

    // 生成唯一的推荐码
    const newReferralCode = await this.generateUniqueReferralCode();

    // 创建用户和钱包
    const user = await prisma.$transaction(async (tx) => {
      // 创建用户
      const newUser = await tx.user.create({
        data: {
          role: UserRole.USER,
          referralCode: newReferralCode,
          referredBy: referrer ? { connect: { id: referrer.id } } : undefined,
          agent: agent ? { connect: { id: agent.id } } : undefined,
          kycStatus: KycStatus.PENDING,
          isActive: true,
        },
      });

      // 创建钱包记录
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          chainId: 1, // 默认以太坊主网
          address: address.toLowerCase(),
          isPrimary: true,
          label: '主钱包',
        },
      });

      return newUser;
    });

    // 记录审计日志
    await this.auditService.log({
      actorId: user.id,
      actorType: 'USER',
      action: 'USER_REGISTER',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        address,
        registrationMethod: 'web3',
        referrerCode: referralCode,
      },
    });

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // Web3钱包登录
  async web3Login(web3LoginDto: Web3LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const { address, signature } = web3LoginDto;

    // 验证签名
    const challenge = this.web3Challenges.get(address.toLowerCase());
    if (!challenge) {
      throw new BadRequestException('请先获取签名挑战');
    }

    if (new Date() > challenge.expiresAt) {
      this.web3Challenges.delete(address.toLowerCase());
      throw new BadRequestException('签名挑战已过期，请重新获取');
    }

    const isSignatureValid = this.verifyWeb3Signature(address, challenge.challenge, signature);
    if (!isSignatureValid) {
      throw new UnauthorizedException('签名验证失败');
    }

    // 清理使用过的挑战
    this.web3Challenges.delete(address.toLowerCase());

    // 查找用户
    const user = await this.usersService.findByWalletAddress(address);
    if (!user) {
      throw new UnauthorizedException('该钱包地址未注册');
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用');
    }

    // 更新最后登录时间
    await this.usersService.updateLastLogin(user.id);

    // 记录审计日志
    await this.auditService.log({
      actorId: user.id,
      actorType: 'USER',
      action: 'USER_LOGIN',
      resourceType: 'USER',
      resourceId: user.id,
      ipAddress,
      userAgent,
      metadata: {
        address,
        loginMethod: 'web3',
      },
    });

    // 生成JWT令牌
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // 修改密码
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findById(userId);
    if (!user || !user.passwordHash) {
      throw new BadRequestException('用户不存在或未设置密码');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('当前密码错误');
    }

    // 验证新密码
    if (!validatePassword(newPassword)) {
      throw new BadRequestException('新密码必须至少8位，包含大小写字母、数字和特殊字符');
    }

    // 更新密码
    const newPasswordHash = await hash(newPassword, 12);
    await this.usersService.updatePassword(userId, newPasswordHash);

    // 记录审计日志
    await this.auditService.log({
      actorId: userId,
      actorType: 'USER',
      action: 'PASSWORD_CHANGE',
      resourceType: 'USER',
      resourceId: userId,
    });

    return { message: '密码修改成功' };
  }

  // 忘记密码（发送重置邮件）
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 为了安全，不透露用户是否存在
      return { message: '如果该邮箱已注册，您将收到密码重置邮件' };
    }

    // 生成重置令牌（这里简化处理，实际项目中需要实现邮件服务）
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

    // 保存重置令牌到用户记录（需要在数据库schema中添加相关字段）
    // await this.usersService.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

    // TODO: 发送重置邮件
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: '如果该邮箱已注册，您将收到密码重置邮件' };
  }

  // 验证JWT令牌
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('令牌无效');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('令牌无效');
    }
  }

  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('刷新令牌无效');
      }

      // 生成新的访问令牌
      const accessToken = await this.generateAccessToken(user);
      const expiresIn = this.getTokenExpiresIn();

      return { accessToken, expiresIn };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  // 登出（将令牌加入黑名单）
  async logout(userId: string, token: string): Promise<{ message: string }> {
    // TODO: 实现令牌黑名单机制
    // await this.tokenBlacklistService.addToBlacklist(token);

    await this.auditService.log({
      actorId: userId,
      actorType: 'USER',
      action: 'USER_LOGOUT',
      resourceType: 'USER',
      resourceId: userId,
    });

    return { message: '登出成功' };
  }

  // 私有方法：生成JWT令牌
  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  // 私有方法：生成访问令牌
  private async generateAccessToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
    });
  }

  // 私有方法：获取令牌过期时间（秒）
  private getTokenExpiresIn(): number {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');
    // 简化处理，实际项目中需要更精确的解析
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return parseInt(expiresIn);
  }

  // 私有方法：生成Web3挑战字符串
  private generateChallenge(): string {
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    return `请签名此消息以验证您的身份\n\n时间戳: ${timestamp}\n随机数: ${random}\n\n此操作不会产生任何费用。`;
  }

  // 私有方法：验证Web3签名
  private verifyWeb3Signature(address: string, message: string, signature: string): boolean {
    try {
      const msgBuffer = Buffer.from(message, 'utf8');
      const msgHex = bufferToHex(msgBuffer);
      const recoveredAddress = recoverPersonalSignature({
        data: msgHex,
        sig: signature,
      });

      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Web3 signature verification error:', error);
      return false;
    }
  }

  // 私有方法：生成唯一推荐码
  private async generateUniqueReferralCode(): Promise<string> {
    let code!: string;
    let isUnique = false;

    while (!isUnique) {
      // 生成6位随机字母数字组合
      code = randomBytes(3).toString('hex').toUpperCase() + 
             Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      const existingUser = await this.usersService.findByReferralCode(code);
      if (!existingUser) {
        isUnique = true;
      }
    }

    return code;
  }

  // 私有方法：清理过期的Web3挑战
  private cleanExpiredChallenges(): void {
    const now = new Date();
    for (const [address, challenge] of this.web3Challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.web3Challenges.delete(address);
      }
    }
  }

  // 私有方法：清理用户敏感信息
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}