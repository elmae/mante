import { Request, Response, NextFunction } from 'express'; // Eliminar RequestHandler no usado
import { HttpException } from '../common/exceptions/http.exception';
import { ValidationException } from '../common/exceptions/validation.exception';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import Logger from '../config/logger.config'; // Importar el logger
/**
 * Wrapper para manejar errores en funciones asíncronas
 * @param fn Función asíncrona a ejecutar
 */
// Definir tipo específico para la función de middleware asíncrono
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export const asyncHandler =
  (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const errorMiddleware = (error: Error, req: Request, res: Response, _next: NextFunction) => {
  // Prefijar 'next' no usado con _
  let status = 500;
  let message = 'Error interno del servidor';
  let details = undefined;
  const success = false; // Usar const ya que no se reasigna

  // Log error details using Winston logger
  Logger.error('❌ Error procesando solicitud:', {
    path: req.path,
    method: req.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack // Considerar omitir stack en producción si es muy verboso
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
