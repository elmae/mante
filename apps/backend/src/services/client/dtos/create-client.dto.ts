import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  contact_email!: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  contact_phone!: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateClientResponseDto {
  id!: string;
  name!: string;
  contact_email!: string;
  contact_phone!: string;
  address?: string;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;
  created_by_id!: string;
  updated_by_id!: string;
}
