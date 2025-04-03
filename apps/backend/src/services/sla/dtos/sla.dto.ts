import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Matches,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { MaintenanceType } from "../../../domain/entities/sla-config.entity";

// Regex para validar formato de intervalo PostgreSQL (e.g., '2 hours', '30 minutes', '1 day')
const INTERVAL_REGEX = /^(\d+)\s+(minute|minutes|hour|hours|day|days)$/;

export class CreateSLAConfigDto {
  @IsUUID()
  @IsNotEmpty()
  zone_id!: string;

  @IsUUID()
  @IsOptional()
  client_id?: string;

  @IsEnum(MaintenanceType)
  maintenance_type!: MaintenanceType;

  @IsString()
  @IsNotEmpty()
  @Matches(INTERVAL_REGEX, {
    message: 'Response time must be in format: "X minutes/hours/days"',
  })
  response_time!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(INTERVAL_REGEX, {
    message: 'Resolution time must be in format: "X minutes/hours/days"',
  })
  resolution_time!: string;
}

export class UpdateSLAConfigDto {
  @IsUUID()
  @IsOptional()
  zone_id?: string;

  @IsUUID()
  @IsOptional()
  client_id?: string;

  @IsEnum(MaintenanceType)
  @IsOptional()
  maintenance_type?: MaintenanceType;

  @IsString()
  @IsOptional()
  @Matches(INTERVAL_REGEX, {
    message: 'Response time must be in format: "X minutes/hours/days"',
  })
  response_time?: string;

  @IsString()
  @IsOptional()
  @Matches(INTERVAL_REGEX, {
    message: 'Resolution time must be in format: "X minutes/hours/days"',
  })
  resolution_time?: string;
}

export class SLAFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsUUID()
  @IsOptional()
  zoneId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsEnum(MaintenanceType)
  @IsOptional()
  maintenanceType?: MaintenanceType;

  @IsOptional()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  isActive?: boolean;
}

export class ComplianceQueryDto {
  @IsUUID()
  @IsNotEmpty()
  slaId!: string;

  @Type(() => Date)
  @IsNotEmpty()
  startDate!: Date;

  @Type(() => Date)
  @IsNotEmpty()
  endDate!: Date;
}

export class SLAValidationRequestDto {
  @IsUUID()
  @IsNotEmpty()
  slaId!: string;

  @IsUUID()
  @IsNotEmpty()
  ticketId!: string;
}

export class SLAResponseDto {
  id!: string;
  zone_id!: string;
  client_id?: string;
  maintenance_type!: MaintenanceType;
  response_time!: string;
  resolution_time!: string;
  created_at!: Date;
  updated_at!: Date;

  // Campos calculados
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  current_compliance?: {
    response_time: number;
    resolution_time: number;
  };
}

export class SLAComplianceResponseDto {
  sla_id!: string;
  period!: {
    start: Date;
    end: Date;
  };
  metrics!: {
    total_tickets: number;
    response_time_compliance: number;
    resolution_time_compliance: number;
    average_response_time: number;
    average_resolution_time: number;
  };
  violations!: Array<{
    ticket_id: string;
    type: "response_time" | "resolution_time";
    expected: number;
    actual: number;
    difference: number;
  }>;
  recommendations?: string[];
}
