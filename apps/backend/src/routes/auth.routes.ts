import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { TokenBlacklistService } from '../services/auth/adapters/input/token-blacklist.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { LoginDto } from '../services/auth/dtos/login.dto';
import { RedisService } from '../infrastructure/redis/redis.service';
import { DataSource } from 'typeorm';

export const createAuthRouter = (
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
) => {
  const router = Router();

  // Inicializar servicios específicos de auth
  const redisService = new RedisService();
  const tokenBlacklistService = new TokenBlacklistService(redisService);
  const authService = new AuthService(userService, jwtService, tokenBlacklistService);
  const authController = new AuthController(authService);

  // Inicializar middleware de autenticación
  const authMiddleware = new AuthMiddleware(jwtService, userService, authService);

  // Rutas públicas
  router.post(
    '/login',
    ValidationMiddleware.validate(LoginDto),
    authController.login.bind(authController)
  );

  router.post('/refresh', authController.refreshToken.bind(authController));

  // Rutas protegidas
  router.get(
    '/validate',
    authMiddleware.authenticate,
    authController.validateToken.bind(authController)
  );

  router.post('/logout', authMiddleware.authenticate, authController.logout.bind(authController));

  return router;
};
