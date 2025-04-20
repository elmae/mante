// Auth Types
export * from './types/auth.types';

// Auth Service
export * from './services/auth.service';

// Auth Controller
export * from './controllers/auth.controller';

// Auth Module
export * from './auth.module';

// JWT Strategy
export { JwtStrategy, type JwtPayload, type AuthenticatedUser } from './strategies/jwt.strategy';

// Re-export from common guards for convenience
export {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  RolesGuard,
  type GuardContext
} from '../common/guards';

// Constants
export const AUTH_CONFIG = {
  JWT: {
    EXPIRES_IN: '1h',
    REFRESH_EXPIRES_IN: '7d',
    ALGORITHM: 'HS256'
  },
  TOKEN: {
    LENGTH: 64,
    RESET_LENGTH: 32,
    PASSWORD_RESET_EXPIRES_IN: '1h'
  },
  SECURITY: {
    SALT_ROUNDS: 10,
    MIN_PASSWORD_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000 // 15 minutes
  }
} as const;

// Error Messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_MISSING: 'No token provided',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  ACCOUNT_LOCKED: 'Account is temporarily locked'
} as const;

// Register exports for dependency injection
export const AUTH_PROVIDERS = {
  JWT_CONFIG: 'JWT_CONFIG',
  AUTH_SERVICE: 'AUTH_SERVICE'
} as const;

// Export utility types
export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type RequireOnlyOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];
