import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from './roles.decorator'
import { UserRole } from '@qa-app/database'

/**
 * Composite auth decorator.
 * - @Auth() applies JwtAuthGuard
 * - @Auth(roles) applies JwtAuthGuard + RolesGuard + @Roles(...roles)
 * Accepts both UserRole enum and string literals for compatibility.
 */
export function Auth(...roles: (UserRole | string)[]): ClassDecorator & MethodDecorator {
  const decorators: (ClassDecorator | MethodDecorator)[] = [UseGuards(JwtAuthGuard, RolesGuard)]
  if (roles && roles.length > 0) {
    decorators.push(Roles(...(roles as UserRole[])) as any)
  }
  return applyDecorators(...decorators)
}

