import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, KycStatus } from '@qa-app/database';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { KYC_REQUIRED_KEY } from '../decorators/kyc-required.decorator';
import { CurrentUser } from '../interfaces/auth.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取所需角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 获取KYC要求
    const kycRequired = this.reflector.getAllAndOverride<boolean>(KYC_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有设置角色要求且不需要KYC，则允许通过
    if (!requiredRoles && !kycRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('用户信息不存在');
    }

    // 检查角色权限
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException(`需要以下角色之一: ${requiredRoles.join(', ')}`);
      }
    }

    // 检查KYC状态
    if (kycRequired) {
      if (user.kycStatus !== KycStatus.APPROVED) {
        throw new ForbiddenException('需要完成KYC认证才能访问此功能');
      }
    }

    return true;
  }
}