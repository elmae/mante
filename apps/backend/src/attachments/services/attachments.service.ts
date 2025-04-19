import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Readable } from 'stream';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Attachment } from '../../domain/entities/attachment.entity';
import { CreateAttachmentDto, AttachmentResponseDto } from '../../domain/dtos/attachment.dto';
import { FileStorageOptions, RetentionPolicyRule } from '../../services/files';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @Inject('FILE_STORAGE_OPTIONS')
    private readonly options: FileStorageOptions,
    @Inject('RETENTION_RULES')
    private readonly retentionRules: RetentionPolicyRule[]
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    dto: CreateAttachmentDto
  ): Promise<AttachmentResponseDto> {
    const attachment = this.attachmentRepository.create({
      ...dto,
      file_name: file.originalname,
      file_path: file.path,
      mime_type: file.mimetype,
      file_size: file.size,
      created_by_id: userId
    });

    await this.attachmentRepository.save(attachment);
    return AttachmentResponseDto.fromEntity(attachment);
  }

  async downloadFile(
    fileId: string
  ): Promise<{ stream: Readable; attachment: AttachmentResponseDto }> {
    const attachment = await this.findAttachmentOrFail(fileId);

    try {
      const stream = Readable.from(await fs.readFile(attachment.file_path));
      return {
        stream,
        attachment: AttachmentResponseDto.fromEntity(attachment)
      };
    } catch (error) {
      throw new NotFoundException('File not found in storage');
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const attachment = await this.findAttachmentOrFail(fileId);
    const recyclePath = this.generateRecyclePath(attachment.file_path);

    try {
      await fs.mkdir(path.dirname(recyclePath), { recursive: true });
      await fs.rename(attachment.file_path, recyclePath);

      attachment.deleted_at = new Date();
      attachment.deleted_by_id = userId;
      await this.attachmentRepository.save(attachment);
    } catch (error) {
      throw new BadRequestException('Error moving file to recycle bin');
    }
  }

  async restoreFile(fileId: string): Promise<AttachmentResponseDto> {
    const attachment = await this.findAttachmentOrFail(fileId);
    if (!attachment.deleted_at) {
      throw new BadRequestException('File is not in recycle bin');
    }

    const originalPath = this.getOriginalPathFromRecycle(attachment.file_path);

    try {
      await fs.mkdir(path.dirname(originalPath), { recursive: true });
      await fs.rename(attachment.file_path, originalPath);

      attachment.deleted_at = undefined;
      attachment.deleted_by_id = undefined;
      attachment.file_path = originalPath;
      await this.attachmentRepository.save(attachment);

      return AttachmentResponseDto.fromEntity(attachment);
    } catch (error) {
      throw new BadRequestException('Error restoring file from recycle bin');
    }
  }

  async getFileInfo(fileId: string): Promise<AttachmentResponseDto> {
    const attachment = await this.findAttachmentOrFail(fileId);
    return AttachmentResponseDto.fromEntity(attachment);
  }

  async getFilesByParent(
    parentType: 'ticket' | 'maintenance',
    parentId: string
  ): Promise<AttachmentResponseDto[]> {
    const query = this.attachmentRepository
      .createQueryBuilder('attachment')
      .where(
        parentType === 'ticket' ? 'ticket_id = :parentId' : 'maintenance_record_id = :parentId',
        { parentId }
      )
      .andWhere('deleted_at IS NULL');

    const attachments = await query.getMany();
    return attachments.map(attachment => AttachmentResponseDto.fromEntity(attachment));
  }

  async getDeletedFiles(userId: string): Promise<AttachmentResponseDto[]> {
    const attachments = await this.attachmentRepository.find({
      where: {
        deleted_by_id: userId,
        deleted_at: Not(IsNull())
      }
    });
    return attachments.map(attachment => AttachmentResponseDto.fromEntity(attachment));
  }

  async emptyRecycleBin(userId: string): Promise<void> {
    const deletedFiles = await this.attachmentRepository.find({
      where: {
        deleted_by_id: userId,
        deleted_at: Not(IsNull())
      }
    });

    for (const file of deletedFiles) {
      try {
        await fs.unlink(file.file_path);
      } catch (error) {
        console.error(`Error deleting file ${file.file_path}:`, error);
      }
      await this.attachmentRepository.remove(file);
    }
  }

  private async findAttachmentOrFail(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    return attachment;
  }

  private generateRecyclePath(originalPath: string): string {
    const fileName = path.basename(originalPath);
    return path.join(this.options.recycleBinPath, fileName);
  }

  private getOriginalPathFromRecycle(recyclePath: string): string {
    const fileName = path.basename(recyclePath);
    return path.join(this.options.uploadPath, fileName);
  }
}
