import { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

export * from './jwt-auth.guard';
export * from './roles.guard';

export const GlobalGuards: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard
  }
];

// Re-export common guard types
export interface GuardContext {
  user?: any;
  roles?: string[];
  isPublic?: boolean;
}

// Utility function to check if a route is public
export function isPublicRoute(metadata: any): boolean {
  return metadata?.isPublic === true;
}

// Utility function to get required roles from metadata
export function getRequiredRoles(metadata: any): string[] | undefined {
  return metadata?.roles;
}

// Common guard error messages
export const GUARD_ERRORS = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INVALID_TOKEN: 'Invalid or expired token',
  MISSING_TOKEN: 'No token provided',
  MISSING_ROLE: 'Required role not found',
  INACTIVE_USER: 'User account is inactive'
} as const;
