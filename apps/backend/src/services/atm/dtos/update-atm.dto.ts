import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsArray,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { Point } from "geojson";

export class TechnicalSpecsDto {
  @IsString()
  @IsOptional()
  cpu?: string;

  @IsString()
  @IsOptional()
  memory?: string;

  @IsString()
  @IsOptional()
  os?: string;

  @IsNumber()
  @IsOptional()
  cash_capacity?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  supported_transactions?: string[];

  // Permitir propiedades adicionales
  [key: string]: any;
}

export class LocationDto implements Point {
  @IsString()
  @IsNotEmpty()
  type: "Point" = "Point";

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates!: number[];
}

export class UpdateAtmDto {
  @IsString()
  @IsOptional()
  serial_number?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto;

  @IsString()
  @IsOptional()
  address?: string;

  @ValidateNested()
  @Type(() => TechnicalSpecsDto)
  @IsObject()
  @IsOptional()
  technical_specs?: TechnicalSpecsDto;

  @IsUUID()
  @IsOptional()
  client_id?: string;

  @IsUUID()
  @IsOptional()
  zone_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

// DTOs adicionales para operaciones específicas
export class LocationQueryDto {
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @IsNumber()
  @IsNotEmpty()
  radius!: number; // en metros
}

export class AtmStatusDto {
  status!: "operational" | "maintenance" | "out_of_service";
  last_maintenance!: Date | null;
  uptime!: number;
  needs_maintenance!: boolean;
}
