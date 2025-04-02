import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error.types";
import Logger from "../config/logger.config";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.error(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
      },
    });
  }

  // Error de validación de TypeORM
  if (error.name === "QueryFailedError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Error en la operación de base de datos",
      },
    });
  }

  // Error inesperado
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Error interno del servidor",
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Recurso no encontrado",
    },
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
