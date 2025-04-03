export class UnauthorizedException extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedException";
    Error.captureStackTrace(this, this.constructor);
  }

  getStatus(): number {
    return 401;
  }

  getResponse(): { statusCode: number; message: string } {
    return {
      statusCode: this.getStatus(),
      message: this.message,
    };
  }
}
