import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterClientDto {
  @ApiProperty({ description: 'Filtrar por nombre', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filtrar por email de contacto', required: false })
  @IsOptional()
  @IsString()
  contact_email?: string;

  @ApiProperty({ description: 'Filtrar por teléfono de contacto', required: false })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiProperty({ description: 'Filtrar por dirección', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Filtrar por estado de activación', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  is_active?: boolean;
}
