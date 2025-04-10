import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../common/exceptions/http.exception';
import { ValidationException } from '../common/exceptions/validation.exception';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { BadRequestException } from '../common/exceptions/bad-request.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';

export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = 'Error interno del servidor';
  let details = undefined;
  let success = false;

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
