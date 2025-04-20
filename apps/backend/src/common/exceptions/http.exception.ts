import { HttpException as NestHttpException } from '@nestjs/common';

export interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
}

export class HttpException extends NestHttpException {
  constructor(response: string | HttpExceptionResponse, status: number, details?: any) {
    if (typeof response === 'string') {
      response = {
        statusCode: status,
        message: response,
        error: 'Http Exception',
        details
      };
    }
    super(response, status);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access', details?: any) {
    super(message, 401, details);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden resource', details?: any) {
    super(message, 403, details);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string, details?: any) {
    super(message, 404, details);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    super(message, 422, details);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string, details?: any) {
    super(message, 409, details);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, details);
  }
}
