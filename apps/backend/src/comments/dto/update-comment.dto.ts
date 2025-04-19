import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTicketCommentDto, CreateMaintenanceCommentDto } from './create-comment.dto';

export class UpdateTicketCommentDto extends PartialType(CreateTicketCommentDto) {
  @ApiPropertyOptional({ description: 'El contenido actualizado del comentario' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdateMaintenanceCommentDto extends PartialType(CreateMaintenanceCommentDto) {
  @ApiPropertyOptional({ description: 'El contenido actualizado del comentario' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Indica si el comentario es de naturaleza técnica' })
  @IsOptional()
  @IsBoolean()
  is_technical?: boolean;

  @ApiPropertyOptional({ description: 'Indica si el comentario es interno' })
  @IsOptional()
  @IsBoolean()
  is_internal?: boolean;
}
