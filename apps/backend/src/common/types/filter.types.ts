import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface BaseFilterDto {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  startDate?: Date;
  endDate?: Date;
}

// Clase base para DTOs de filtrado con validación
export class FilterDto implements BaseFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

// Tipo para opciones de filtrado genéricas
export interface FilterOptions<T = any> extends BaseFilterDto {
  where?: Partial<T>;
  relations?: string[];
  select?: (keyof T)[];
}

// Interfaz para resultados paginados
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper para crear opciones de filtrado
export function createFilterOptions<T>(
  filterDto: Partial<FilterDto>,
  defaultOptions: Partial<FilterOptions<T>> = {}
): FilterOptions<T> {
  return {
    page: filterDto.page || defaultOptions.page || 1,
    limit: filterDto.limit || defaultOptions.limit || 10,
    sortBy: filterDto.sortBy || defaultOptions.sortBy,
    sortOrder: filterDto.sortOrder || defaultOptions.sortOrder || SortOrder.DESC,
    search: filterDto.search || defaultOptions.search,
    startDate: filterDto.startDate || defaultOptions.startDate,
    endDate: filterDto.endDate || defaultOptions.endDate,
    where: defaultOptions.where || {},
    relations: defaultOptions.relations || [],
    select: defaultOptions.select || []
  };
}

// Constantes comunes para filtrado
export const FILTER_CONSTANTS = {
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT_ORDER: SortOrder.DESC
} as const;
