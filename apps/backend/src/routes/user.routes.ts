import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user/adapters/input/user.service";
import { UserRepository } from "../services/user/adapters/output/user.repository";
import { getRepository } from "typeorm";
import { User } from "../domain/entities/user.entity";
import { validate } from "../middleware/validation.middleware";
import { CreateUserDto } from "../services/user/dtos/create-user.dto";
import { UpdateUserDto } from "../services/user/dtos/update-user.dto";
import { createAuthMiddleware } from "../middleware/auth.middleware";
import { JwtService } from "../services/auth/adapters/input/jwt.service";
import { RoleType } from "../domain/entities/role.entity";

export function setupUserRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const userRepository = new UserRepository(getRepository(User));
  const userService = new UserService(userRepository);
  const jwtService = new JwtService();
  const authMiddleware = createAuthMiddleware(jwtService, userService);
  const userController = new UserController(userService);

  // Apply auth middleware to all routes
  router.use(authMiddleware.authenticate);

  // Define routes
  router.get(
    "/",
    authMiddleware.hasPermission(["read:users"]),
    userController.list.bind(userController)
  );

  router.get(
    "/:id",
    authMiddleware.hasPermission(["read:users"]),
    userController.findById.bind(userController)
  );

  router.post(
    "/",
    authMiddleware.hasRole([RoleType.ADMIN]),
    validate(CreateUserDto),
    userController.create.bind(userController)
  );

  router.patch(
    "/:id",
    authMiddleware.hasPermission(["update:users"]),
    validate(UpdateUserDto),
    userController.update.bind(userController)
  );

  router.delete(
    "/:id",
    authMiddleware.hasRole([RoleType.ADMIN]),
    userController.delete.bind(userController)
  );

  return router;
}

export const userRoutes = setupUserRoutes();
