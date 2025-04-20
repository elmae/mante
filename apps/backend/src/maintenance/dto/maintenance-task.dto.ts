import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDate
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../../domain/entities';

export class CreateMaintenanceTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @IsString()
  estimatedDuration?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  technicalNotes?: Record<string, any>;
}

export class UpdateMaintenanceTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  @IsOptional()
  @IsString()
  actualDuration?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  technicalNotes?: Record<string, any>;
}
