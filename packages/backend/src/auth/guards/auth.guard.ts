import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UsersService } from '../../users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('访问令牌不存在');
    }

    try {
      // 验证JWT令牌
      const payload = await this.jwtService.verifyAsync(token);
      
      // 从数据库获取最新用户信息
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('用户账户已被禁用');
      }

      // 检查角色和KYC状态是否发生变化
      if (user.role !== payload.role || user.kycStatus !== payload.kycStatus) {
        throw new UnauthorizedException('用户信息已变更，请重新登录');
      }

      // 将用户信息添加到请求对象中
      request['user'] = {
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
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('访问令牌无效');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}