import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDate,
  IsNumber,
  IsOptional,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { MaintenanceType } from "../../../domain/entities/maintenance-record.entity";

export class MaintenancePartDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class StartMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  ticket_id!: string;

  @IsUUID()
  @IsNotEmpty()
  atm_id!: string;

  @IsUUID()
  @IsNotEmpty()
  technician_id!: string;

  @IsEnum(MaintenanceType)
  type!: MaintenanceType;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_time?: Date = new Date();
}

export class CompleteMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  work_performed!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenancePartDto)
  parts_used!: MaintenancePartDto[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_time?: Date = new Date();
}

export class AddPartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenancePartDto)
  parts!: MaintenancePartDto[];
}

export class MaintenanceFilterDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsEnum(MaintenanceType, { each: true })
  @IsOptional()
  type?: MaintenanceType[];

  @IsUUID()
  @IsOptional()
  atmId?: string;

  @IsUUID()
  @IsOptional()
  technicianId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fromDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  toDate?: Date;

  @IsOptional()
  isComplete?: boolean;

  @IsUUID()
  @IsOptional()
  ticketId?: string;
}

export class MaintenanceStatsResponseDto {
  totalCount!: number;
  completedCount!: number;
  averageDuration!: number;
  byType!: Record<MaintenanceType, number>;
  mostCommonParts!: Array<{
    name: string;
    count: number;
  }>;
  technicianPerformance!: Array<{
    technician_id: string;
    technician_name: string;
    completed_count: number;
    average_duration: number;
  }>;
}

export class MaintenanceHistoryResponseDto {
  total_count!: number;
  last_maintenance!: Date | null;
  maintenance_types!: Record<MaintenanceType, number>;
  total_parts_used!: number;
  common_issues!: string[];
  average_resolution_time?: number;
  cost_analysis?: {
    total_parts_cost: number;
    average_maintenance_cost: number;
    cost_by_type: Record<MaintenanceType, number>;
  };
}
