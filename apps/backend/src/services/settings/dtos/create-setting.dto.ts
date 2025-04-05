import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { SettingScope, SettingDataType } from '../../../domain/entities/settings.entity';

export class CreateSettingDto {
  @IsNotEmpty()
  @IsString()
  key!: string;

  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsNotEmpty()
  @IsEnum(SettingScope)
  scope!: SettingScope;

  @IsNotEmpty()
  @IsEnum(SettingDataType)
  data_type!: SettingDataType;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSettingResponseDto {
  id!: string;
  key!: string;
  value!: string;
  scope!: SettingScope;
  data_type!: SettingDataType;
  description?: string;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;
  created_by_id!: string;
  updated_by_id!: string;
}
