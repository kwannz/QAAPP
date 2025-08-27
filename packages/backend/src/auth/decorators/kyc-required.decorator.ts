import { SetMetadata } from '@nestjs/common';

export const KYC_REQUIRED_KEY = 'kycRequired';

/**
 * 标记接口需要KYC认证通过才能访问
 * 
 * @example
 * ```typescript
 * @KycRequired()
 * @Post('purchase')
 * async purchaseProduct() {
 *   return { message: '购买成功' };
 * }
 * ```
 */
export const KycRequired = () => SetMetadata(KYC_REQUIRED_KEY, true);