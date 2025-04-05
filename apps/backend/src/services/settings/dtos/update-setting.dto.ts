import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { SettingScope, SettingDataType } from '../../../domain/entities/settings.entity';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsEnum(SettingScope)
  scope?: SettingScope;

  @IsOptional()
  @IsEnum(SettingDataType)
  data_type?: SettingDataType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateSettingResponseDto {
  id!: string;
  key!: string;
  value!: string;
  scope!: SettingScope;
  data_type!: SettingDataType;
  description?: string;
  is_active!: boolean;
  updated_at!: Date;
  updated_by_id!: string;
}
