import { OmitType, PartialType } from '@nestjs/swagger';
import { IsString, MinLength, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../entities/user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'username'] as const)
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
}
