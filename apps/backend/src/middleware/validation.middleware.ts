import { Request, Response, NextFunction } from 'express';
import { validate as classValidate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationException } from '../common/exceptions/validation.exception';

type Type<T> = {
  new (...args: any[]): T;
};

export class ValidationMiddleware {
  static async validateDto<T extends object>(type: Type<T>, data: any): Promise<T> {
    const dto = plainToClass(type, data);
    const errors = await classValidate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      const formattedErrors = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value
      }));

      throw new ValidationException('La validación falló', formattedErrors);
    }

    return dto;
  }

  static validate<T extends object>(type: Type<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await this.validateDto(type, req.body);
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
