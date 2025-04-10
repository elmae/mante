import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { LoginDto } from '../services/auth/dtos/login.dto';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { BadRequestException } from '../common/exceptions/bad-request.exception';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ValidationMiddleware.validateDto(LoginDto, req.body);
      const result = await this.authService.login(req.body);

      res.json({
        success: true,
        data: {
          token: result.access_token,
          refreshToken: result.refresh_token,
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            permissions: result.user.permissions
          }
        }
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        next(error);
      } else if (error instanceof BadRequestException) {
        next(error);
      } else {
        next(new UnauthorizedException('Error durante el proceso de login'));
      }
    }
  }

  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const user = await this.authService.validateToken(token);
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            permissions: user.permissions
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }

      const result = await this.authService.refreshToken(refreshToken);
      res.json({
        success: true,
        data: {
          token: result.access_token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      await this.authService.logout(token);
      res.json({
        success: true,
        data: {
          message: 'Sesión cerrada exitosamente'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
