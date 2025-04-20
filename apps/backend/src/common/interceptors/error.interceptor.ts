import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';

export interface HttpErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ErrorInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      catchError(error => {
        let exception: HttpException;

        if (error instanceof HttpException) {
          exception = error;
        } else if (error instanceof QueryFailedError) {
          exception = this.handleDatabaseError(error);
        } else {
          this.logger.error(error.stack);
          exception = new InternalServerErrorException('An unexpected error occurred');
        }

        const errorResponse = this.formatError(exception, { method, url });

        // Log error details
        this.logger.error({
          message: `${method} ${url} failed`,
          error: errorResponse,
          timestamp: new Date().toISOString()
        });

        return throwError(() => exception);
      })
    );
  }

  private handleDatabaseError(error: QueryFailedError): HttpException {
    // PostgreSQL error codes
    const pgErrorCodes = {
      UNIQUE_VIOLATION: '23505',
      FOREIGN_KEY_VIOLATION: '23503',
      CHECK_VIOLATION: '23514'
    };

    switch (error.driverError?.code) {
      case pgErrorCodes.UNIQUE_VIOLATION:
        return new HttpException(
          {
            statusCode: 409,
            message: 'A record with this value already exists',
            error: 'Conflict'
          },
          409
        );

      case pgErrorCodes.FOREIGN_KEY_VIOLATION:
        return new HttpException(
          {
            statusCode: 400,
            message: 'Referenced record does not exist',
            error: 'Bad Request'
          },
          400
        );

      default:
        return new InternalServerErrorException('An error occurred while accessing the database');
    }
  }

  private formatError(
    exception: HttpException,
    context: { method: string; url: string }
  ): HttpErrorResponse {
    const response = exception.getResponse();
    const statusCode = exception.getStatus();

    if (typeof response === 'string') {
      return {
        statusCode,
        message: response,
        error: exception.name,
        path: context.url,
        timestamp: new Date().toISOString()
      };
    }

    return {
      ...(response as object),
      path: context.url,
      timestamp: new Date().toISOString()
    } as HttpErrorResponse;
  }
}
