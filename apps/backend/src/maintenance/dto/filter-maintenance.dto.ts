import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class FilterMaintenanceDto {
  @IsOptional()
  @IsUUID()
  atm_id?: string;

  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsDateString()
  date_from?: string;

  @IsOptional()
  @IsDateString()
  date_to?: string;

  @IsOptional()
  @IsBoolean()
  requires_follow_up?: boolean;

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
}
