import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { MaintenanceStatus, MaintenanceType } from '../../domain/entities/maintenance.entity';

export class FilterMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  atmId?: string;

  @IsOptional()
  requiresFollowUp?: boolean;

  // Paginación
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;

  // Ordenamiento
  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
