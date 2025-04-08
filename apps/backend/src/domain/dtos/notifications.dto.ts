import { IsString, IsUUID, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(['email', 'in_app', 'push'] as const)
  type!: NotificationType;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsUUID()
  user_id!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  email_notifications?: boolean;

  @IsOptional()
  in_app_notifications?: boolean;

  @IsOptional()
  push_notifications?: boolean;
}
