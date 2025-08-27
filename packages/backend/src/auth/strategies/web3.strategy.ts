import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import { UsersService } from '../../users/users.service';
import { validateWalletAddress } from '@qa-app/database';

export interface Web3AuthRequest {
  address: string;
  message: string;
  signature: string;
}

@Injectable()
export class Web3Strategy extends PassportStrategy(Strategy, 'web3') {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { address, message, signature }: Web3AuthRequest = req.body;

    // 验证输入参数
    if (!address || !message || !signature) {
      throw new UnauthorizedException('缺少必要的认证参数');
    }

    if (!validateWalletAddress(address)) {
      throw new UnauthorizedException('钱包地址格式无效');
    }

    // 验证签名
    const isValidSignature = this.verifySignature(address, message, signature);
    if (!isValidSignature) {
      throw new UnauthorizedException('签名验证失败');
    }

    // 查找用户
    const user = await this.usersService.findByWalletAddress(address);
    if (!user) {
      throw new UnauthorizedException('该钱包地址未注册');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户账户已被禁用');
    }

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
    };
  }

  private verifySignature(address: string, message: string, signature: string): boolean {
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
}