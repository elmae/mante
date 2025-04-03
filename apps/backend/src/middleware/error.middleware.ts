import { Request, Response, NextFunction } from "express";
import { ValidationException } from "../common/exceptions/validation.exception";
import { UnauthorizedException } from "../common/exceptions/unauthorized.exception";

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  errors?: any[];
  stack?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let response: ErrorResponse;

  // Handle specific error types
  if (err instanceof ValidationException) {
    response = err.getResponse();
  } else if (err instanceof UnauthorizedException) {
    response = {
      statusCode: 401,
      error: "Unauthorized",
      message: err.message,
    };
  } else {
    // Default error handling
    response = {
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    };
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;

    // Log the error
    console.error("Error:", {
      ...response,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }

  res.status(response.statusCode).json(response);
}

// Handle 404 errors
export function notFoundHandler(req: Request, res: Response) {
  const response: ErrorResponse = {
    statusCode: 404,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  };

  res.status(404).json(response);
}

// Handle validation errors from express-validator
export function validationErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err?.validation) {
    const response: ErrorResponse = {
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
      errors: err.validation,
    };
    return res.status(400).json(response);
  }
  next(err);
}

// Handle async errors
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
