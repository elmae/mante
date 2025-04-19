import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export class MaintenancePartDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MaintenanceMeasurementDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  unit?: string;
}

export class CreateMaintenanceDto {
  @IsUUID()
  ticket_id: string;

  @IsUUID()
  atm_id: string;

  @IsUUID()
  @IsOptional()
  technician_id?: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenancePartDto)
  @IsOptional()
  parts?: MaintenancePartDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceMeasurementDto)
  @IsOptional()
  measurements?: MaintenanceMeasurementDto[];

  @IsBoolean()
  @IsOptional()
  requires_follow_up?: boolean;

  @IsString()
  @IsOptional()
  follow_up_notes?: string;
}
