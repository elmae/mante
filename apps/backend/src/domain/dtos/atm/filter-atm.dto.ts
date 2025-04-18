import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max
} from 'class-validator';

export class FilterAtmDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  client_id?: string;

  @IsUUID()
  @IsOptional()
  zone_id?: string;

  @IsEnum(['active', 'inactive', 'maintenance', 'error'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'maintenance' | 'error';

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sort_by?: string = 'created_at';

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  // Parámetros para búsqueda por proximidad
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000) // Máximo 1000 km de radio
  @Type(() => Number)
  radius?: number; // Radio en kilómetros para búsqueda por proximidad

  // Filtros técnicos
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  software_version?: string;
}
