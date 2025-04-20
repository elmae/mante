import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string | string[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Validation Error'
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: id ? `${resource} with id ${id} not found` : `${resource} not found`,
        error: 'Not Found'
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `${resource} with this ${field} already exists`,
        error: 'Conflict'
      },
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidOperationException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Invalid Operation'
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized'
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden'
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class FileUploadException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'File Upload Error'
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class DatabaseException extends HttpException {
  constructor(message: string = 'Database error occurred') {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Database Error'
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// Helper function to determine if an error is a specific type of exception
export function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}

// Helper function to create error messages
export function createErrorMessage(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\${(\w+)}/g, (_, key) => String(params[key] || ''));
}
