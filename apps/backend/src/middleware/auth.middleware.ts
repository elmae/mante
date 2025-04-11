import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { AuthService } from '../services/auth/adapters/input/auth.service';

import { Request as ExpressRequest } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
      permissions: string[];
    };
  }
}

// Type para mantener compatibilidad
export type AuthenticatedRequest = ExpressRequest & {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
};

export class AuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}
  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    try {
      token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      console.log('Token recibido:', token);
      console.log('Longitud del token:', token.length);
      console.log('Prefijo del token:', token.substring(0, 10) + '...');
      console.log('Config JWT (hash):', this.jwtService.getConfig().secret.substring(0, 3) + '...');

      // Verificar si el token está en la blacklist
      const isBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token invalidado');
      }

      console.log('Iniciando verificación del token...');
      const payload = this.jwtService.verify(token);
      console.log('Token verificado exitosamente. Payload:', {
        sub: payload.sub,
        iat: payload.iat,
        exp: payload.exp
      });

      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Usuario inactivo o no encontrado');
      }

      const permissions = user.role.permissions?.map(p => p.name) || [];

      // Adjuntar información del usuario a la request
      req.user = {
        id: user.id,
        role: user.role.name,
        permissions: permissions
      };

      next();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error detallado al verificar token:');
      console.error('Tipo de error:', err.name);
      console.error('Mensaje:', err.message);
      console.error('Stack:', err.stack);
      console.log('Token completo recibido:', req.headers.authorization);
      console.log('Token extraído:', token);
      next(new UnauthorizedException(`Invalid token: ${err.message}`));
    }
  };

  hasRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedException('User not authenticated'));
      }

      if (!roles.includes(req.user.role)) {
        return next(new UnauthorizedException('Permisos de rol insuficientes'));
      }

      next();
    };
  };

  hasPermission = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedException('User not authenticated'));
      }

      const hasRequiredPermissions = permissions.every(permission =>
        req.user?.permissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        return next(new UnauthorizedException('Permisos insuficientes'));
      }

      next();
    };
  };

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// Factory function to create middleware instance
export function createAuthMiddleware(
  jwtService: JwtService,
  userService: UserService,
  authService: AuthService
) {
  const middleware = new AuthMiddleware(jwtService, userService, authService);
  return {
    authenticate: middleware.authenticate,
    hasRole: middleware.hasRole,
    hasPermission: middleware.hasPermission
  };
}
