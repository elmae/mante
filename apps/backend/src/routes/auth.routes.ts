import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { LoginDto } from '../services/auth/dtos/login.dto';
import { DataSource } from 'typeorm';

export const createAuthRouter = async (
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService,
  authService: AuthService
) => {
  const router = Router();

  try {
    const authController = new AuthController(authService);
    const authMiddleware = new AuthMiddleware(jwtService, userService, authService);

    // Configurar rutas
    // Rutas públicas
    router.post(
      '/login',
      ValidationMiddleware.validate(LoginDto),
      authController.login.bind(authController)
    );

    router.post<{}, {}, {}, {}, AuthenticatedRequest>(
      '/refresh',
      authController.refreshToken.bind(authController)
    );

    // Rutas protegidas
    router.get(
      '/validate',
      authMiddleware.authenticate,
      authController.validateToken.bind(authController)
    );

    router.post<{}, {}, {}, {}, AuthenticatedRequest>(
      '/logout',
      authMiddleware.authenticate,
      authController.logout.bind(authController)
    );

    return router;
  } catch (error) {
    console.error('❌ Error inicializando servicios de autenticación:', error);
    throw error;
  }
};
