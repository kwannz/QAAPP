import { SetMetadata } from '@nestjs/common';

export const WALLET_REQUIRED_KEY = 'walletRequired';

/**
 * 标记接口需要绑定钱包地址才能访问
 * 
 * @example
 * ```typescript
 * @WalletRequired()
 * @Post('withdraw')
 * async withdraw() {
 *   return { message: '提现成功' };
 * }
 * ```
 */
export const WalletRequired = () => SetMetadata(WALLET_REQUIRED_KEY, true);