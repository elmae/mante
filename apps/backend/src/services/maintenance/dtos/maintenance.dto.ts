import { IsString, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class StartMaintenanceDto {
  @IsString()
  ticket_id: string;

  @IsString()
  atm_id: string;

  @IsString()
  @IsOptional()
  technician_id?: string;

  @IsString()
  initial_diagnosis: string;
}

export class CompleteMaintenanceDto {
  @IsString()
  work_performed: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Date)
  end_time?: Date;
}

export class PartDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddPartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}

export class TechnicalMeasurementDto {
  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  threshold?: number;
}

export class UpdateMeasurementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechnicalMeasurementDto)
  measurements: TechnicalMeasurementDto[];
}

export class SetFollowUpDto {
  @IsBoolean()
  requires_follow_up: boolean;

  @IsString()
  @IsOptional()
  follow_up_notes?: string;
}

export class AddCommentDto {
  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  is_technical?: boolean;

  @IsOptional()
  technical_details?: {
    parts_used?: string[];
    measurements?: Record<string, number>;
    issues_found?: string[];
    recommendations?: string[];
  };
}

export class MaintenanceFilterDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsUUID()
  atm_id?: string;

  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @IsOptional()
  @Type(() => Date)
  from_date?: Date;

  @IsOptional()
  @Type(() => Date)
  to_date?: Date;

  @IsOptional()
  @IsBoolean()
  requires_follow_up?: boolean;

  @IsOptional()
  @IsString()
  search_term?: string;
}
