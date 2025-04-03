import {
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  MinLength,
  IsBoolean,
} from "class-validator";

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsUUID()
  @IsOptional()
  role_id?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
