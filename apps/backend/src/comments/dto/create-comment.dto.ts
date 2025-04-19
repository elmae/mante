import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketCommentDto {
  @ApiProperty({ description: 'El contenido del comentario' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID del ticket al que pertenece el comentario' })
  @IsUUID()
  ticket_id: string;
}

export class CreateMaintenanceCommentDto {
  @ApiProperty({ description: 'El contenido del comentario' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID del registro de mantenimiento al que pertenece el comentario' })
  @IsUUID()
  maintenance_record_id: string;

  @ApiPropertyOptional({ description: 'Indica si el comentario es de naturaleza técnica' })
  @IsOptional()
  @IsBoolean()
  is_technical?: boolean;

  @ApiPropertyOptional({ description: 'Indica si el comentario es interno' })
  @IsOptional()
  @IsBoolean()
  is_internal?: boolean;
}
