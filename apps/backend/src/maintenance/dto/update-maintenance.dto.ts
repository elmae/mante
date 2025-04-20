import { IsOptional, IsEnum, IsDate, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { CreateMaintenanceDto } from './create-maintenance.dto';
import { MaintenanceStatus } from '../../domain/entities';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedDate?: Date;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsBoolean()
  requiresFollowUp?: boolean;

  @IsOptional()
  technicalDetails?: Record<string, any>;

  // Campos adicionales para actualizar relaciones
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  addPartIds?: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  removePartIds?: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  addTaskIds?: string[];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  removeTaskIds?: string[];
}
