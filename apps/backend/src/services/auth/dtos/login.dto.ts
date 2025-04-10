import { IsEmail, IsString, MinLength } from 'class-validator';
import { User } from '../../../domain/entities/user.entity';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export interface TokenPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    permissions: string[];
    is_active: boolean;
  };
}

export type AuthenticatedUser = Pick<User, 'id' | 'email' | 'role' | 'is_active'>;
