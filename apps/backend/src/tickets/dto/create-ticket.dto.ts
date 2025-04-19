import { IsString, IsNotEmpty, IsEnum, IsUUID, IsOptional, IsArray } from 'class-validator';
import { TicketType, TicketPriority } from '../../domain/entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsUUID()
  @IsNotEmpty()
  atm_id: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
  }>;
}
