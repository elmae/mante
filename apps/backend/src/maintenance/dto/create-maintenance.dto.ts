import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDate,
  IsNumber,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceStatus, MaintenanceType } from '../../domain/entities';

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @IsNotEmpty()
  @IsUUID()
  atmId: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsBoolean()
  requiresFollowUp?: boolean;

  @IsOptional()
  technicalDetails?: Record<string, any>;

  // Arrays de IDs para crear relaciones
  @IsOptional()
  @IsUUID(undefined, { each: true })
  partIds?: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  taskIds?: string[];
}
