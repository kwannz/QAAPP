import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../interfaces/auth.interface';

/**
 * 获取当前已认证的用户信息
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUser) {
 *   return {
 *     id: user.id,
 *     email: user.email,
 *     role: user.role,
 *     kycStatus: user.kycStatus,
 *   };
 * }
 * 
 * // 只获取用户ID
 * @Post('update')
 * async updateProfile(@CurrentUser('id') userId: string) {
 *   // 使用 userId
 * }
 * 
 * // 只获取用户角色
 * @Get('dashboard')
 * async getDashboard(@CurrentUser('role') userRole: UserRole) {
 *   // 根据角色返回不同的仪表板
 * }
 * ```
 */
export const GetCurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);