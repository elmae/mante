export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{
      property: string;
      constraints?: { [type: string]: string };
      value?: any;
    }>
  ) {
    super(message);
    this.name = "ValidationException";
    Error.captureStackTrace(this, this.constructor);
  }

  getStatus(): number {
    return 400;
  }

  getResponse() {
    return {
      statusCode: this.getStatus(),
      error: "Bad Request",
      message: this.message,
      errors: this.errors,
    };
  }

  toJSON() {
    return this.getResponse();
  }

  toString() {
    const response = this.getResponse();
    return `ValidationException: ${JSON.stringify(response)}`;
  }
}
