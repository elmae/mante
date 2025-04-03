import {
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  MinLength,
  IsBoolean,
} from "class-validator";
import { RoleType } from "../../../domain/entities/role.entity";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsUUID()
  role_id!: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

// DTO para respuestas (sin campos sensibles)
export class UserResponseDto {
  id!: string;
  username!: string;
  email!: string;
  full_name?: string;
  role_id!: string;
  role_name!: RoleType;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;
}
