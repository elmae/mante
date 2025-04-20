import { StreamableFile } from '@nestjs/common';

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message?: string;
  path?: string;
  timestamp?: string;
  duration?: string;
}

export type Response<T> = ApiResponse<T> | StreamableFile;

export interface PaginatedResponse<T> extends Omit<ApiResponse<T[]>, 'data'> {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path?: string;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = void> {
  statusCode: number;
  data: T;
  message?: string;
}

// Constantes para códigos de estado HTTP comunes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Tipos de utilidad
export type ApiResponseType = 'success' | 'error' | 'paginated';

// Funciones de ayuda
export function createApiResponse<T>(
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  message?: string
): ApiResponse<T> {
  return {
    statusCode,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(
  message: string | string[],
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error: string = 'Internal Server Error'
): ApiErrorResponse {
  return {
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString()
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    statusCode: HTTP_STATUS.OK,
    data: {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  };
}
