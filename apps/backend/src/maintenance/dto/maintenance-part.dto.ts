import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaintenancePartDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  partNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  unitCost: number;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsString()
  warrantyPeriod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  specifications?: Record<string, any>;
}

export class UpdateMaintenancePartDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  partNumber?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitCost?: number;

  @IsOptional()
  @IsString()
  unitType?: string;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsString()
  warrantyPeriod?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  specifications?: Record<string, any>;
}

export class MaintenancePartResponseDto extends CreateMaintenancePartDto {
  @IsUUID()
  id: string;

  @IsUUID()
  maintenanceId: string;

  @IsUUID()
  addedById: string;

  createdAt: Date;
  updatedAt: Date;
}
