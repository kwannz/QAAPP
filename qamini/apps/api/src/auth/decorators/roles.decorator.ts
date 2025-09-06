import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@qa-app/database';

/**
 * Strongly-typed Roles decorator.
 * Usage: `@Roles(UserRole.ADMIN, UserRole.MANAGER)`
 * Note: This is the authoritative version. Do not duplicate in other paths.
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
