import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../common/exceptions/unauthorized.exception";
import { JwtService } from "../services/auth/adapters/input/jwt.service";
import { UserService } from "../services/user/adapters/input/user.service";

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
    private readonly userService: UserService
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException("No token provided");
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException("User is inactive or not found");
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => p.name),
      };

      next();
    } catch (error) {
      next(new UnauthorizedException("Invalid token"));
    }
  };

  hasRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedException("User not authenticated"));
      }

      if (!roles.includes(req.user.role)) {
        return next(new UnauthorizedException("Insufficient role permissions"));
      }

      next();
    };
  };

  hasPermission = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new UnauthorizedException("User not authenticated"));
      }

      const hasRequiredPermissions = permissions.every((permission) =>
        req.user?.permissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        return next(new UnauthorizedException("Insufficient permissions"));
      }

      next();
    };
  };

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

// Factory function to create middleware instance
export function createAuthMiddleware(
  jwtService: JwtService,
  userService: UserService
) {
  const middleware = new AuthMiddleware(jwtService, userService);
  return {
    authenticate: middleware.authenticate,
    hasRole: middleware.hasRole,
    hasPermission: middleware.hasPermission,
  };
}
