import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@qa-app/database';

export const ROLES_KEY = 'roles';

/**
 * 设置访问接口所需的用户角色
 * 
 * @param roles 允许访问的用户角色数组
 * 
 * @example
 * ```typescript
 * // 只允许管理员访问
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 * async adminOnlyEndpoint() {
 *   return { message: '管理员专用接口' };
 * }
 * 
 * // 允许代理商和管理员访问
 * @Roles(UserRole.AGENT, UserRole.ADMIN)
 * @Get('agent-or-admin')
 * async agentOrAdminEndpoint() {
 *   return { message: '代理商或管理员可访问' };
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);