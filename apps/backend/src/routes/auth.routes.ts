import { Router } from 'express';
import { DataSource } from 'typeorm';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth/adapters/input/auth.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { validate } from '../middleware/validation.middleware';
import { LoginDto } from '../services/auth/dtos/login.dto';

export function createAuthRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Initialize dependencies
  const authService = new AuthService(userService, jwtService);
  const authController = new AuthController(authService);

  // Define routes
  router.post('/login', validate(LoginDto), authController.login.bind(authController));

  router.post('/refresh', authController.refreshToken.bind(authController));

  router.post('/logout', authController.logout.bind(authController));

  router.get('/validate', authController.validateToken.bind(authController));

  return router;
}
