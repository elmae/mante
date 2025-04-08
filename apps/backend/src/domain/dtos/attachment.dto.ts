import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttachmentDto {
  @IsOptional()
  @IsUUID()
  ticket_id?: string;

  @IsOptional()
  @IsUUID()
  maintenance_record_id?: string;

  @IsNotEmpty()
  @IsString()
  file_name: string;

  @IsNotEmpty()
  @IsString()
  mime_type: string;

  @IsNotEmpty()
  @IsNumber()
  file_size: number;
}

export class UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  file_name?: string;
}

export class AttachmentResponseDto {
  id: string;
  ticket_id?: string;
  maintenance_record_id?: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: Date;
  created_by_id: string;
  deleted_at?: Date;
  deleted_by_id?: string;
  public_url: string;
  parent_type: 'ticket' | 'maintenance' | 'unknown';

  static fromEntity(entity: any): AttachmentResponseDto {
    const dto = new AttachmentResponseDto();
    dto.id = entity.id;
    dto.ticket_id = entity.ticket_id;
    dto.maintenance_record_id = entity.maintenance_record_id;
    dto.file_name = entity.file_name;
    dto.file_path = entity.file_path;
    dto.mime_type = entity.mime_type;
    dto.file_size = entity.file_size;
    dto.created_at = entity.created_at;
    dto.created_by_id = entity.created_by_id;
    dto.deleted_at = entity.deleted_at;
    dto.deleted_by_id = entity.deleted_by_id;
    dto.public_url = `/api/v1/attachments/${entity.id}`;
    dto.parent_type = entity.getParentType?.() || 'unknown';
    return dto;
  }
}
