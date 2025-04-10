import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpException } from '../common/exceptions/http.exception';
import { ValidationException } from '../common/exceptions/validation.exception';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';

/**
 * Wrapper para manejar errores en funciones asíncronas
 * @param fn Función asíncrona a ejecutar
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = 'Error interno del servidor';
  let details = undefined;
  let success = false;

  // Log error details
  console.error('❌ Error procesando solicitud:', {
    path: req.path,
    method: req.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });

  if (error instanceof HttpException) {
    status = error.statusCode;
    message = error.message;
  }

  if (error instanceof ValidationException) {
    status = 400;
    details = error.errors;
  }

  if (error instanceof UnauthorizedException) {
    status = 401;
  }

  if (error instanceof BadRequestException) {
    status = 400;
  }

  if (error instanceof NotFoundException) {
    status = 404;
  }

  res.status(status).json({
    success,
    error: {
      code: status,
      message,
      details
    }
  });
};
