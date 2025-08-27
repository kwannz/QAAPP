import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service';
import { JwtPayload, CurrentUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: configService.get('JWT_ISSUER', 'qa-app'),
      audience: configService.get('JWT_AUDIENCE', 'qa-app-users'),
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUser> {
    const { sub: userId } = payload;

    // 从数据库获取最新的用户信息
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户账户已被禁用');
    }

    // 检查JWT中的角色是否与数据库中的角色一致
    if (user.role !== payload.role) {
      throw new UnauthorizedException('用户权限已变更，请重新登录');
    }

    // 检查JWT中的KYC状态是否与数据库中的状态一致
    if (user.kycStatus !== payload.kycStatus) {
      throw new UnauthorizedException('用户KYC状态已变更，请重新登录');
    }

    // 返回当前用户信息，用于后续请求处理
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      isActive: user.isActive,
      wallets: user.wallets?.map((wallet: any) => ({
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chainId,
        isPrimary: wallet.isPrimary,
        label: wallet.label,
      })),
      agent: user.agent ? {
        id: user.agent.id,
        referralCode: user.agent.referralCode,
      } : undefined,
      positions: user.positions?.map((position: any) => ({
        id: position.id,
        productId: position.productId,
        principal: position.principal.toNumber(),
        status: position.status,
        endDate: position.endDate,
      })),
    };
  }
}