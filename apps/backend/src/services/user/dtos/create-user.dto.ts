import { IsString, IsEmail, MinLength, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  role_id: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
