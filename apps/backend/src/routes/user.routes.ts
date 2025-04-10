import { Router } from 'express';
import { DataSource } from 'typeorm';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user/adapters/input/user.service';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { CreateUserDto } from '../services/user/dtos/create-user.dto';
import { UpdateUserDto } from '../services/user/dtos/update-user.dto';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { RoleType } from '../domain/entities/role.entity';

export function createUserRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Initialize dependencies
  const authMiddleware = createAuthMiddleware(jwtService, userService);
  const userController = new UserController(userService);

  // Apply auth middleware to all routes
  router.use(authMiddleware.authenticate);

  // Define routes
  router.get(
    '/',
    authMiddleware.hasPermission(['read:users']),
    userController.list.bind(userController)
  );

  router.get(
    '/:id',
    authMiddleware.hasPermission(['read:users']),
    userController.findById.bind(userController)
  );

  router.post(
    '/',
    authMiddleware.hasRole(['admin']),
    ValidationMiddleware.validate(CreateUserDto),
    userController.create.bind(userController)
  );

  router.patch(
    '/:id',
    authMiddleware.hasPermission(['update:users']),
    ValidationMiddleware.validate(UpdateUserDto),
    userController.update.bind(userController)
  );

  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    userController.delete.bind(userController)
  );

  return router;
}
