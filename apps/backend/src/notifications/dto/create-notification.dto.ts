import { IsNotEmpty, IsString, IsUUID, IsEnum } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push'
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsNotEmpty()
  @IsUUID()
  user_id!: string;

  metadata?: Record<string, unknown>;
}
