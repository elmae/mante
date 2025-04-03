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
  IsObject,
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
  end_time!: Date;
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
}

export class MaintenanceStatsDto {
  @IsNumber()
  totalCount!: number;

  @IsNumber()
  completedCount!: number;

  @IsNumber()
  averageDuration!: number;

  @IsObject()
  byType!: Record<MaintenanceType, number>;

  @IsArray()
  @ValidateNested({ each: true })
  mostCommonParts!: Array<{
    name: string;
    count: number;
  }>;

  @IsArray()
  @ValidateNested({ each: true })
  technicianPerformance!: Array<{
    technician_id: string;
    completed_count: number;
    average_duration: number;
  }>;
}
