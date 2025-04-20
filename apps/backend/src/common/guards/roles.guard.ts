import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Verify user exists and has a role
    if (!user || !user.role) {
      return false;
    }

    // Admin role has access to everything
    if (user.role === Role.ADMIN) {
      return true;
    }

    return requiredRoles.some(role => user.role === role);
  }
}

// Types
export interface RoleMetadata {
  roles: Role[];
}

// Utility function to check if a user has required roles
export function hasRequiredRoles(userRole: Role, requiredRoles: Role[]): boolean {
  if (userRole === Role.ADMIN) {
    return true;
  }
  return requiredRoles.some(role => userRole === role);
}

// Error messages
export const ROLES_ERRORS = {
  MISSING_ROLES: 'No roles defined for this resource',
  INSUFFICIENT_ROLES: 'User does not have sufficient roles',
  MISSING_USER: 'No user found in request',
  MISSING_ROLE: 'User has no role assigned'
} as const;
