import { HttpException } from './http.exception';

interface ValidationError {
  property: string;
  constraints?: { [type: string]: string };
  value?: any;
}

export class ValidationException extends HttpException {
  constructor(
    message: string = 'Validation failed',
    public readonly errors: ValidationError[]
  ) {
    super(400, message);
    this.name = 'ValidationException';
  }
}
