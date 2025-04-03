import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDate,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { MaintenanceType } from "../../../domain/entities/maintenance-record.entity";
import { MaintenancePartDto } from "./create-maintenance.dto";

export class UpdateMaintenanceDto {
  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  work_performed?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenancePartDto)
  @IsOptional()
  parts_used?: MaintenancePartDto[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_time?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_time?: Date;

  @IsUUID()
  @IsOptional()
  technician_id?: string;
}

export class ReassignMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  technician_id!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class PauseMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expected_resume_time?: Date;
}

export class ResumeMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  notes!: string;
}

export class UpdatePartsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenancePartDto)
  @IsNotEmpty()
  parts!: MaintenancePartDto[];

  @IsBoolean()
  @IsOptional()
  replace_existing?: boolean = false;
}

export class MaintenanceNoteDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  category?: "general" | "issue" | "solution" | "followup";
}

export class MaintenanceChecklistDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  completed_items!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pending_items?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skipped_items?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MaintenanceSignOffDto {
  @IsString()
  @IsNotEmpty()
  technician_notes!: string;

  @IsBoolean()
  @IsOptional()
  requires_followup?: boolean;

  @IsString()
  @IsOptional()
  followup_notes?: string;

  @IsBoolean()
  @IsNotEmpty()
  quality_check_passed!: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  quality_issues?: string[];
}
