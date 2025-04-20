// Base classes
export { BaseController } from './controllers/base.controller';
export { BaseService, type BaseEntity } from './services/base.service';

// Interceptors
export {
  TransformInterceptor,
  LoggingInterceptor,
  ErrorInterceptor,
  TimeoutInterceptor,
  CacheInterceptor,
  type InterceptorResponse,
  type InterceptorOptions,
  WithInterceptors,
  globalInterceptors,
  INTERCEPTOR_METADATA,
  DEFAULT_INTERCEPTOR_CONFIG
} from './interceptors';

// Types
export {
  type ApiResponse,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  type PaginatedResponse,
  HTTP_STATUS,
  createApiResponse,
  createErrorResponse,
  createPaginatedResponse
} from './types/response.types';

export {
  type FilterDto,
  type FilterOptions,
  type PaginatedResult,
  FilterOptions as BaseFilterDto,
  SortOrder,
  FILTER_CONSTANTS,
  createFilterOptions
} from './types/filter.types';

export {
  type GeoPoint,
  type GeoSearch,
  type AuditInfo,
  type FileInfo,
  type DeepPartial,
  type Nullable,
  type Optional,
  type DateRange,
  DATE_FORMATS,
  isDateRange,
  isGeoPoint
} from './types';

// Decorators
export { Public, Roles, AdminOnly, TechnicalStaff, ReadOnlyAccess, GetUser } from './decorators';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';

// Filters
export { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Constants
export const COMMON_CONSTANTS = {
  // Paginación
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Caché
  DEFAULT_CACHE_TTL: 300, // 5 minutos
  MAX_CACHE_SIZE: 1000,

  // Timeouts
  DEFAULT_TIMEOUT: 30000, // 30 segundos
  MAX_TIMEOUT: 300000, // 5 minutos

  // Validación
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,

  // Formatos
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIMEZONE: 'UTC'
} as const;

// Re-export commonly used NestJS decorators and utilities
export {
  Body,
  Query,
  Param,
  Headers,
  Request,
  Response as ExpressResponse,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
  ParseArrayPipe,
  ParseEnumPipe
} from '@nestjs/common';
