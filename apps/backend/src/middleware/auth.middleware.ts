import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { AuthService } from '../services/auth/adapters/input/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export class AuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verificar si el token está en la blacklist
      const isBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token invalidado');
      }

      const payload = this.jwtService.verify(token);
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
    } catch (error) {
      next(new UnauthorizedException('Invalid token'));
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
export function createAuthMiddleware(jwtService: JwtService, userService: UserService) {
  const middleware = new AuthMiddleware(jwtService, userService);
  return {
    authenticate: middleware.authenticate,
    hasRole: middleware.hasRole,
    hasPermission: middleware.hasPermission
  };
}
