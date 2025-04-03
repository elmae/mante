import { Request, Response, NextFunction } from "express";
import { validate as classValidate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationException } from "../common/exceptions/validation.exception";

type Type<T> = {
  new (...args: any[]): T;
};

export function validate<T extends object>(type: Type<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, req.body);
      const errors = await classValidate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new ValidationException("Validation failed", formattedErrors);
      }

      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}
