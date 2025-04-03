import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class AuthResponseDto {
  constructor(
    public token: string,
    public user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    }
  ) {}

  static fromUser(token: string, user: any): AuthResponseDto {
    return new AuthResponseDto(token, {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    });
  }
}
