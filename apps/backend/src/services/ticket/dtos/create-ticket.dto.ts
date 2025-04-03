import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import {
  TicketType,
  TicketPriority,
  TicketStatus,
} from "../../../domain/entities/ticket.entity";

export class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  mimetype!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsNumber()
  size!: number;
}

export class CreateTicketDto {
  @IsUUID()
  @IsNotEmpty()
  atm_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TicketType)
  @IsNotEmpty()
  type!: TicketType;

  @IsEnum(TicketPriority)
  @IsNotEmpty()
  priority!: TicketPriority;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus = TicketStatus.OPEN;

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
