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
  @IsNotEmpty()
  ip_address: string;

  @IsString()
  @IsNotEmpty()
  subnet_mask: string;

  @IsIP()
  @IsNotEmpty()
  gateway: string;
}

class TechnicalDetails {
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsDateString()
  @IsNotEmpty()
  installation_date: Date;

  @IsDateString()
  @IsOptional()
  last_maintenance_date?: Date;

  @IsString()
  @IsNotEmpty()
  software_version: string;

  @IsString()
  @IsNotEmpty()
  hardware_version: string;

  @ValidateNested()
  @Type(() => NetworkConfig)
  network_config: NetworkConfig;

  @IsArray()
  @IsString({ each: true })
  capabilities: string[];
}

class Location {
  @IsString()
  @IsNotEmpty()
  type: 'Point';

  @IsArray()
  @IsNotEmpty()
  coordinates: [number, number];
}

export class CreateAtmDto {
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @ValidateNested()
  @Type(() => Location)
  @IsNotEmpty()
  location: Location;

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
  @IsNotEmpty()
  client_id: string;

  @IsUUID()
  @IsNotEmpty()
  zone_id: string;
}
