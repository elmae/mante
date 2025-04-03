import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth/adapters/input/auth.service";
import { UserService } from "../services/user/adapters/input/user.service";
import { JwtService } from "../services/auth/adapters/input/jwt.service";
import { UserRepository } from "../services/user/adapters/output/user.repository";
import { validate } from "../middleware/validation.middleware";
import { LoginDto } from "../services/auth/dtos/login.dto";
import { getRepository } from "typeorm";
import { User } from "../domain/entities/user.entity";

export function setupAuthRoutes(): Router {
  const router = Router();

  // Initialize dependencies
  const userRepository = new UserRepository(getRepository(User));
  const userService = new UserService(userRepository);
  const jwtService = new JwtService({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
  const authService = new AuthService(userService, jwtService);
  const authController = new AuthController(authService);

  // Define routes
  router.post(
    "/login",
    validate(LoginDto),
    authController.login.bind(authController)
  );

  router.post("/refresh", authController.refreshToken.bind(authController));

  router.post("/logout", authController.logout.bind(authController));

  router.get("/validate", authController.validateToken.bind(authController));

  return router;
}

export const authRoutes = setupAuthRoutes();
