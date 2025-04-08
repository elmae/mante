import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  permissions: string[];
}

export interface TokenPayload {
  sub: string;
  iat?: number;
  exp?: number;
}
