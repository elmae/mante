import { IsString, IsEmail, MinLength, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ description: 'Número de teléfono' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'ID del rol del usuario' })
  @IsUUID()
  role_id: string;

  @ApiPropertyOptional({ description: 'Estado del usuario', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
