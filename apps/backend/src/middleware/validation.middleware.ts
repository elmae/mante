import { Request, Response, NextFunction } from 'express';
import { Role } from '../domain/entities/role.entity';

export interface ValidationRuleBase {
  in: string[];
  optional?: boolean;
  errorMessage?: string;
}

export interface ISO8601ValidationRule extends ValidationRuleBase {
  isISO8601: true;
}

export interface UUIDValidationRule extends ValidationRuleBase {
  isUUID: true;
}

export interface BooleanValidationRule extends ValidationRuleBase {
  isBoolean: true;
}

export interface StringValidationRule extends ValidationRuleBase {
  isString: true;
}

export interface IntValidationRule extends ValidationRuleBase {
  isInt: {
    options: { min: number; max: number };
    errorMessage: string;
  };
}

export interface EnumValidationRule extends ValidationRuleBase {
  isIn: {
    options: [any[]];
    errorMessage: string;
  };
}

export type ValidationRule =
  | ISO8601ValidationRule
  | UUIDValidationRule
  | BooleanValidationRule
  | StringValidationRule
  | IntValidationRule
  | EnumValidationRule;

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationError {
  param: string;
  msg: string;
}

// Helpers para crear reglas de validación tipadas
export const createDateRule = (
  errorMessage: string = 'Fecha inválida',
  optional: boolean = true
): ISO8601ValidationRule => ({
  in: ['query'],
  optional,
  isISO8601: true,
  errorMessage
});

export const createUUIDRule = (
  errorMessage: string = 'UUID inválido',
  optional: boolean = true
): UUIDValidationRule => ({
  in: ['query'],
  optional,
  isUUID: true,
  errorMessage
});

export const createBooleanRule = (
  errorMessage: string = 'Valor booleano inválido',
  optional: boolean = true
): BooleanValidationRule => ({
  in: ['query'],
  optional,
  isBoolean: true,
  errorMessage
});

export const createStringRule = (
  errorMessage: string = 'Texto inválido',
  optional: boolean = true
): StringValidationRule => ({
  in: ['query'],
  optional,
  isString: true,
  errorMessage
});

export const createIntRule = (
  min: number,
  max: number,
  errorMessage: string,
  optional: boolean = true
): IntValidationRule => ({
  in: ['query'],
  optional,
  isInt: {
    options: { min, max },
    errorMessage
  }
});

export const createEnumRule = <T extends string | number>(
  values: readonly T[] | T[],
  errorMessage: string,
  optional: boolean = true
): EnumValidationRule => ({
  in: ['query'],
  optional,
  isIn: {
    options: [Array.from(values)],
    errorMessage
  }
});

export const validatePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userRole = (req as any).user?.role as Role;

    if (!userRole || !userRole.permissions) {
      res.status(403).json({ error: 'No tienes permisos suficientes' });
      return;
    }

    const hasPermission = userRole.permissions.some(
      permission => permission.name === requiredPermission
    );

    if (!hasPermission) {
      res.status(403).json({
        error: `Se requiere el permiso: ${requiredPermission}`
      });
      return;
    }

    next();
  };
};

export const validateQueryParams = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: ValidationError[] = [];

    for (const [param, rules] of Object.entries(schema)) {
      const value = req.query[param];

      // Si el parámetro es opcional y no está presente, continuar
      if (rules.optional && value === undefined) {
        continue;
      }

      // Si el parámetro es requerido y no está presente
      if (!rules.optional && value === undefined) {
        errors.push({
          param,
          msg: rules.errorMessage || `El parámetro ${param} es requerido`
        });
        continue;
      }

      // Validar según el tipo
      if (value !== undefined) {
        if ('isISO8601' in rules) {
          const date = new Date(value as string);
          if (isNaN(date.getTime())) {
            errors.push({
              param,
              msg: rules.errorMessage || `${param} debe ser una fecha válida`
            });
          }
        }

        if ('isUUID' in rules) {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value as string)) {
            errors.push({
              param,
              msg: rules.errorMessage || `${param} debe ser un UUID válido`
            });
          }
        }

        if ('isBoolean' in rules) {
          if (value !== 'true' && value !== 'false') {
            errors.push({
              param,
              msg: rules.errorMessage || `${param} debe ser un booleano`
            });
          }
        }

        if ('isIn' in rules) {
          const validValues = rules.isIn.options[0];
          if (!validValues.includes(value)) {
            errors.push({
              param,
              msg: rules.isIn.errorMessage || `${param} debe ser uno de: ${validValues.join(', ')}`
            });
          }
        }

        if ('isInt' in rules) {
          const num = parseInt(value as string);
          if (isNaN(num) || num < rules.isInt.options.min || num > rules.isInt.options.max) {
            errors.push({
              param,
              msg:
                rules.isInt.errorMessage ||
                `${param} debe ser un número entre ${rules.isInt.options.min} y ${rules.isInt.options.max}`
            });
          }
        }

        if ('isString' in rules && typeof value !== 'string') {
          errors.push({
            param,
            msg: rules.errorMessage || `${param} debe ser un texto`
          });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};

import { plainToInstance } from 'class-transformer';
import {
  validate as classValidate,
  ValidationError as ClassValidationError
} from 'class-validator';
import { RequestHandler } from 'express'; // Asegúrate de que RequestHandler esté importado

export class ValidationMiddleware {
  static validate<T extends object>(dtoClass: new () => T): RequestHandler {
    // <-- Línea restaurada
    return async (req: Request, res: Response, next: NextFunction) => {
      // Usar plainToInstance para convertir el cuerpo de la solicitud al DTO
      // Esto también aplica transformaciones definidas con @Transform si existen
      const dtoInstance = plainToInstance(dtoClass, req.body);

      // Validar la instancia del DTO usando class-validator
      const errors: ClassValidationError[] = await classValidate(dtoInstance);

      if (errors.length > 0) {
        // Mapear los errores de class-validator a un formato más simple si es necesario
        const validationErrors: ValidationError[] = errors.map((error: ClassValidationError) => ({
          param: error.property,
          // Concatenar todos los mensajes de error para esa propiedad
          msg: Object.values(error.constraints || {}).join(', ')
        }));
        // Devolver un error 400 con los detalles de la validación
        return res.status(400).json({ errors: validationErrors });
      } else {
        // Si la validación es exitosa, sobrescribir req.body con la instancia
        // del DTO validada y potencialmente transformada.
        // Esto asegura que los siguientes middlewares/controladores reciban el objeto tipado correcto.
        req.body = dtoInstance;
        // Pasar al siguiente middleware/controlador
        next();
      }
    };
  }
}
