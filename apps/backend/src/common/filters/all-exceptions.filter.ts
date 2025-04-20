import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiErrorResponse } from '../types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'Query Error';
    }

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message,
      error
    };

    // Log error details
    this.logger.error(`${request.method} ${request.url}`, {
      error: exception instanceof Error ? exception.stack : 'Unknown error',
      body: request.body,
      params: request.params,
      query: request.query,
      statusCode: status,
      timestamp: new Date().toISOString()
    });

    response.status(status).json(errorResponse);
  }

  private isValidationError(exception: any): boolean {
    return exception?.response?.message && Array.isArray(exception.response.message);
  }

  private formatValidationErrors(errors: string[]): string[] {
    return errors.map(error => {
      // Remove class-validator constraint keywords
      return error
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim();
    });
  }

  private handleDatabaseError(error: QueryFailedError): { message: string; status: number } {
    // PostgreSQL unique violation
    if (error.message.includes('duplicate key')) {
      return {
        message: 'A record with this value already exists',
        status: HttpStatus.CONFLICT
      };
    }

    // PostgreSQL foreign key violation
    if (error.message.includes('foreign key')) {
      return {
        message: 'Referenced record does not exist',
        status: HttpStatus.BAD_REQUEST
      };
    }

    return {
      message: 'Database error occurred',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    };
  }
}
