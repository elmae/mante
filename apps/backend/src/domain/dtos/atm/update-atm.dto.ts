import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsDateString,
  IsIP
} from 'class-validator';

class NetworkConfig {
  @IsIP()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  subnet_mask?: string;

  @IsIP()
  @IsOptional()
  gateway?: string;
}

class TechnicalDetails {
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsDateString()
  @IsOptional()
  installation_date?: Date;

  @IsDateString()
  @IsOptional()
  last_maintenance_date?: Date;

  @IsString()
  @IsOptional()
  software_version?: string;

  @IsString()
  @IsOptional()
  hardware_version?: string;

  @ValidateNested()
  @Type(() => NetworkConfig)
  @IsOptional()
  network_config?: NetworkConfig;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  capabilities?: string[];
}

class Location {
  @IsString()
  @IsNotEmpty()
  type: 'Point';

  @IsArray()
  @IsNotEmpty()
  coordinates: [number, number];
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
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @ValidateNested()
  @Type(() => Location)
  @IsOptional()
  location?: Location;

  @ValidateNested()
  @Type(() => TechnicalDetails)
  @IsOptional()
  technical_details?: TechnicalDetails;

  @IsEnum(['active', 'inactive', 'maintenance', 'error'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'maintenance' | 'error';

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsUUID()
  @IsOptional()
  client_id?: string;

  @IsUUID()
  @IsOptional()
  zone_id?: string;
}
