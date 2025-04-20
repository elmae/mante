import { IsString, IsOptional, IsBoolean, IsEnum, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum AtmSortField {
  SERIAL_NUMBER = 'serialNumber',
  MODEL = 'model',
  MANUFACTURER = 'manufacturer',
  CREATED_AT = 'createdAt',
  LAST_MAINTENANCE = 'lastMaintenanceDate',
  STATUS = 'isOperational'
}

export class FilterAtmDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsBoolean()
  isOperational?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  maintenanceFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  maintenanceTo?: Date;

  @IsOptional()
  @IsEnum(AtmSortField)
  sortBy?: AtmSortField = AtmSortField.CREATED_AT;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  // Filtros de ubicación
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  radius?: number; // Radio en kilómetros

  // Filtros de rendimiento
  @IsOptional()
  @IsNumber()
  minUptime?: number;

  @IsOptional()
  @IsNumber()
  maxErrorRate?: number;

  @IsOptional()
  @IsBoolean()
  requiresMaintenance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPendingUpdates?: boolean;

  // Filtros de inventario
  @IsOptional()
  @IsBoolean()
  lowCashLevel?: boolean;

  @IsOptional()
  @IsBoolean()
  lowReceiptPaper?: boolean;

  @IsOptional()
  @IsBoolean()
  lowCardStock?: boolean;
}
