import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string | HttpStatus;
    details?: any;
  };
  metadata?: {
    timestamp?: string;
    path?: string;
    method?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorDetails {
  name?: string;
  message: string;
  stack?: string;
  code?: string | number;
  details?: any;
}

export interface RequestMetadata {
  url: string;
  method: string;
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  timestamp?: string;
  duration?: number;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: any;
}

export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: string | HttpStatus;
    details?: any;
  };
}

// Type guards
export function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

export function isPaginatedResponse<T>(data: any): data is PaginatedResponse<T> {
  return (
    data &&
    Array.isArray(data.items) &&
    typeof data.total === 'number' &&
    typeof data.page === 'number' &&
    typeof data.limit === 'number' &&
    typeof data.totalPages === 'number'
  );
}
