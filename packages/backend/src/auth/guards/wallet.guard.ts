import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UsersService } from '../../users/users.service';
import { WALLET_REQUIRED_KEY } from '../decorators/wallet-required.decorator';
import { CurrentUser } from '../interfaces/auth.interface';

@Injectable()
export class WalletGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否需要钱包验证
    const walletRequired = this.reflector.getAllAndOverride<boolean>(WALLET_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果不需要钱包验证，则允许通过
    if (!walletRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('用户信息不存在');
    }

    // 检查用户是否绑定了钱包
    const userWithWallets = await this.usersService.findById(user.id);
    
    if (!userWithWallets?.wallets || userWithWallets.wallets.length === 0) {
      throw new ForbiddenException('需要绑定钱包地址才能访问此功能');
    }

    // 检查是否有主钱包
    const hasPrimaryWallet = userWithWallets.wallets.some((wallet: any) => wallet.isPrimary);
    if (!hasPrimaryWallet) {
      throw new ForbiddenException('需要设置主钱包地址');
    }

    // 将钱包信息添加到用户对象中
    request.user.wallets = userWithWallets.wallets.map((wallet: any) => ({
      id: wallet.id,
      address: wallet.address,
      chainId: wallet.chainId,
      isPrimary: wallet.isPrimary,
      label: wallet.label,
    }));

    return true;
  }
}