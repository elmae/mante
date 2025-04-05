import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsPhoneNumber()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateClientResponseDto {
  id!: string;
  name!: string;
  contact_email!: string;
  contact_phone!: string;
  address?: string;
  is_active!: boolean;
  updated_at!: Date;
  updated_by_id!: string;
}
