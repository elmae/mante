// Auth decorators
export { Roles, AdminOnly, TechnicalStaff, ReadOnlyAccess } from './roles.decorator';
export { Public } from './public.decorator';
export { GetUser } from './get-user.decorator';

// Validation decorators
export {
  IsGeoPoint,
  TransformGeoPoint,
  type GeoPoint,
  type GeoPointInput,
  type GeoPointValidationOptions
} from './geo-point.decorator';

// Common types and interfaces
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Re-export commonly used validation decorators for convenience
export {
  IsString,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  IsObject,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  Max,
  Length,
  Matches
} from 'class-validator';

// Re-export commonly used transformation decorators
export { Type, Transform, Expose, Exclude } from 'class-transformer';
