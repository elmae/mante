import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user/adapters/input/user.service";
import { CreateUserDto } from "../services/user/dtos/create-user.dto";
import { UpdateUserDto } from "../services/user/dtos/update-user.dto";
import { UserFilters } from "../services/user/ports/input/user.port";
import { User } from "../domain/entities/user.entity";
import { asyncHandler } from "../middleware/error.middleware";

export class UserController {
  constructor(private readonly userService: UserService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = this.validatePaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    const filters: UserFilters = {
      page,
      limit,
      role: req.query.role as string,
      isActive: req.query.isActive === "true",
      search: req.query.search as string,
    };

    const result = await this.userService.list(filters);
    return res.json(result);
  });

  findById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json(
        this.formatErrorResponse(404, "User not found")
      );
    }
    return res.json(this.formatUserResponse(user));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const createUserDto: CreateUserDto = req.body;
    const user = await this.userService.create(createUserDto);
    return res.status(201).json(this.formatUserResponse(user));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const updateUserDto: UpdateUserDto = req.body;
    const user = await this.userService.update(req.params.id, updateUserDto);
    return res.json(this.formatUserResponse(user));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.userService.delete(req.params.id);
    return res.status(204).send();
  });

  // Additional helper methods for request validation and response formatting
  private validatePaginationParams(
    page?: string,
    limit?: string
  ): { page: number; limit: number } {
    return {
      page: Math.max(1, parseInt(page || "1")),
      limit: Math.min(100, Math.max(1, parseInt(limit || "10"))),
    };
  }

  private formatUserResponse(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private formatErrorResponse(statusCode: number, message: string) {
    return {
      statusCode,
      error: this.getErrorName(statusCode),
      message,
    };
  }

  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      409: "Conflict",
      500: "Internal Server Error",
    };
    return errorNames[statusCode] || "Internal Server Error";
  }
}
