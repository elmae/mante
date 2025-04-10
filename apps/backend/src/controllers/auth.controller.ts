import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { LoginDto } from '../services/auth/dtos/login.dto';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { BadRequestException } from '../common/exceptions/bad-request.exception';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📥 Petición de login recibida:', {
        body: req.body,
        headers: req.headers
      });

      const result = await this.authService.login(req.body as LoginDto);
      console.log('🔐 Resultado de autenticación:', {
        userId: result.user.id,
        role: result.user.role
      });

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
      console.error(
        '❌ Error en login:',
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          : 'Error desconocido'
      );

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
      const { refresh_token } = req.body as { refresh_token: string };
      if (!refresh_token) {
        throw new UnauthorizedException('No refresh token provided');
      }

      const result = await this.authService.refreshToken(refresh_token);
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
