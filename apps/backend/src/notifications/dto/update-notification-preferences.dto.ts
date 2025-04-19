import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  in_app_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;
}
