import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientDto {
  @ApiProperty({ description: 'Nombre del cliente', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Email de contacto del cliente', required: false })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiProperty({ description: 'Teléfono de contacto del cliente', required: false })
  @IsOptional()
  @IsPhoneNumber()
  contact_phone?: string;

  @ApiProperty({ description: 'Dirección del cliente', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}
