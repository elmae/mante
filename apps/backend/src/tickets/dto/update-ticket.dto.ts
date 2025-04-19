import { IsString, IsOptional, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../../domain/entities/ticket.entity';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}

export class AssignTicketDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  technician_id: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}
