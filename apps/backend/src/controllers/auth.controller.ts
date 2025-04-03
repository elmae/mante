import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth/adapters/input/auth.service";
import { LoginDto } from "../services/auth/dtos/login.dto";
import { UnauthorizedException } from "../common/exceptions/unauthorized.exception";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async validateToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException("No token provided");
      }

      const user = await this.authService.validateToken(token);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.body.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedException("No refresh token provided");
      }

      const result = await this.authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractTokenFromHeader(req);
      if (!token) {
        throw new UnauthorizedException("No token provided");
      }

      await this.authService.logout(token);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
