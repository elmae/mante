import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import {
  TicketType,
  TicketPriority,
  TicketStatus,
} from "../../../domain/entities/ticket.entity";
import { AttachmentDto } from "./create-ticket.dto";

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TicketType)
  @IsOptional()
  type?: TicketType;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsUUID()
  @IsOptional()
  assigned_to?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  due_date?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];
}

export class AssignTicketDto {
  @IsUUID()
  @IsNotEmpty()
  technician_id!: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status!: TicketStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class TicketFilterDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsEnum(TicketStatus, { each: true })
  @IsOptional()
  status?: TicketStatus[];

  @IsEnum(TicketType, { each: true })
  @IsOptional()
  type?: TicketType[];

  @IsEnum(TicketPriority, { each: true })
  @IsOptional()
  priority?: TicketPriority[];

  @IsUUID()
  @IsOptional()
  atm_id?: string;

  @IsUUID()
  @IsOptional()
  technician_id?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  from_date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  to_date?: Date;

  @IsOptional()
  is_overdue?: boolean;

  @IsString()
  @IsOptional()
  search_term?: string;
}

export class TicketStatsDto {
  total!: number;
  by_status!: Record<TicketStatus, number>;
  by_type!: Record<TicketType, number>;
  by_priority!: Record<TicketPriority, number>;
  average_resolution_time!: number;
  overdue_count!: number;
}

export class TicketResponseDto {
  data!: any;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
