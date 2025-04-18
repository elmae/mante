import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { Response, NextFunction } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private authMiddleware: AuthMiddleware;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    this.authMiddleware = new AuthMiddleware(jwtService, userService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();

    return new Promise<boolean>((resolve, reject) => {
      const next: NextFunction = (error?: any) => {
        if (error) {
          if (error instanceof Error) {
            reject(new UnauthorizedException(error.message));
          } else {
            reject(new UnauthorizedException('Error de autenticación'));
          }
        } else {
          resolve(true);
        }
      };

      void this.authMiddleware.authenticate(request, response, next);
    });
  }
}
