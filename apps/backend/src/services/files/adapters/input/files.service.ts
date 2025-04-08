import { IFilesPort, FileStorageOptions, RetentionPolicyRule } from '../../ports/input/files.port';
import { IStoragePort } from '../../ports/output/storage.port';
import { IAttachmentRepositoryPort } from '../../ports/output/storage.port';
import { IAuditLogPort, FileOperationLog } from '../../ports/output/storage.port';
import { CreateAttachmentDto, AttachmentResponseDto } from '../../../../domain/dtos/attachment.dto';
import { BadRequestError } from '../../../../common/exceptions/bad-request.exception';
import path from 'path';

export class FilesService implements IFilesPort {
  constructor(
    private readonly storagePort: IStoragePort,
    private readonly attachmentRepository: IAttachmentRepositoryPort,
    private readonly auditLogPort: IAuditLogPort,
    private readonly options: FileStorageOptions,
    private readonly retentionRules: RetentionPolicyRule[]
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    dto: CreateAttachmentDto
  ): Promise<AttachmentResponseDto> {
    // Validar el archivo
    this.validateFile(file);

    // Generar ruta única para el archivo
    const filePath = this.generateFilePath(file.originalname);

    // Guardar el archivo usando el adaptador de almacenamiento
    const saveResult = await this.storagePort.saveFile(file, filePath);

    // Crear registro en la base de datos
    const attachment = await this.attachmentRepository.save({
      ...dto,
      file_name: file.originalname,
      file_path: saveResult.path,
      mime_type: saveResult.mimeType,
      file_size: saveResult.size,
      created_by_id: userId
    });

    // Registrar la operación
    await this.auditLogPort.logFileOperation({
      fileId: attachment.id,
      operation: 'upload',
      userId,
      timestamp: new Date(),
      details: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }
    });

    return AttachmentResponseDto.fromEntity(attachment);
  }

  async downloadFile(
    fileId: string
  ): Promise<{ stream: NodeJS.ReadableStream; attachment: AttachmentResponseDto }> {
    const attachment = await this.attachmentRepository.findById(fileId);
    if (!attachment) {
      throw new BadRequestError('File not found');
    }

    const fileResult = await this.storagePort.getFile(attachment.file_path);

    return {
      stream: fileResult.stream,
      attachment: AttachmentResponseDto.fromEntity(attachment)
    };
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(fileId);
    if (!attachment) {
      throw new BadRequestError('File not found');
    }

    // Mover a la papelera de reciclaje
    const recyclePath = this.generateRecyclePath(attachment.file_path);
    await this.storagePort.moveFile(attachment.file_path, recyclePath);

    // Actualizar registro en la base de datos
    await this.attachmentRepository.markAsDeleted(fileId);

    // Registrar la operación
    await this.auditLogPort.logFileOperation({
      fileId,
      operation: 'move_to_recycle',
      userId,
      timestamp: new Date(),
      details: {
        originalPath: attachment.file_path,
        recyclePath
      }
    });
  }

  async restoreFile(fileId: string, userId: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(fileId);
    if (!attachment) {
      throw new BadRequestError('File not found');
    }

    // Restaurar desde la papelera de reciclaje
    const originalPath = this.getOriginalPathFromRecycle(attachment.file_path);
    await this.storagePort.moveFile(attachment.file_path, originalPath);

    // Actualizar registro en la base de datos
    await this.attachmentRepository.markAsRestored(fileId);

    // Registrar la operación
    await this.auditLogPort.logFileOperation({
      fileId,
      operation: 'restore',
      userId,
      timestamp: new Date(),
      details: {
        recyclePath: attachment.file_path,
        originalPath
      }
    });

    return AttachmentResponseDto.fromEntity(attachment);
  }

  async getFileInfo(fileId: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(fileId);
    if (!attachment) {
      throw new BadRequestError('File not found');
    }

    return AttachmentResponseDto.fromEntity(attachment);
  }

  async getFilesByParent(
    parentType: 'ticket' | 'maintenance',
    parentId: string
  ): Promise<AttachmentResponseDto[]> {
    const attachments = await this.attachmentRepository.findByParent(parentType, parentId);
    return attachments.map(attachment => AttachmentResponseDto.fromEntity(attachment));
  }

  async getDeletedFiles(userId: string): Promise<AttachmentResponseDto[]> {
    const attachments = await this.attachmentRepository.getDeletedByUser(userId);
    return attachments.map(attachment => AttachmentResponseDto.fromEntity(attachment));
  }

  async emptyRecycleBin(userId: string): Promise<void> {
    const deletedFiles = await this.getDeletedFiles(userId);

    for (const file of deletedFiles) {
      await this.storagePort.deleteFile(file.file_path);
      await this.attachmentRepository.delete(file.id);

      await this.auditLogPort.logFileOperation({
        fileId: file.id,
        operation: 'permanent_delete',
        userId,
        timestamp: new Date(),
        details: {
          reason: 'recycle_bin_emptied'
        }
      });
    }
  }

  async runRetentionPolicy(): Promise<void> {
    const expiredFiles = await this.attachmentRepository.getExpiredFiles(this.retentionRules);

    for (const file of expiredFiles) {
      await this.deleteFile(file.id, 'system');
    }
  }

  async cleanupRecycleBin(): Promise<void> {
    const recycleBinSize = await this.storagePort.getDirectorySize(this.options.recycleBinPath);

    if (recycleBinSize > this.options.recycleBinMaxSize) {
      const deletedFiles = await this.attachmentRepository.getDeletedByUser('system');
      const sortedFiles = deletedFiles.sort(
        (a, b) => (a.deleted_at?.getTime() || 0) - (b.deleted_at?.getTime() || 0)
      );

      let currentSize = recycleBinSize;
      for (const file of sortedFiles) {
        if (currentSize <= this.options.recycleBinMaxSize) break;

        await this.storagePort.deleteFile(file.file_path);
        await this.attachmentRepository.delete(file.id);
        currentSize -= file.file_size;

        await this.auditLogPort.logFileOperation({
          fileId: file.id,
          operation: 'permanent_delete',
          userId: 'system',
          timestamp: new Date(),
          details: {
            reason: 'recycle_bin_size_limit'
          }
        });
      }
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (file.size > this.options.maxSizeInBytes) {
      throw new BadRequestError(
        `File size exceeds the limit of ${this.options.maxSizeInBytes / (1024 * 1024)}MB`
      );
    }

    if (!this.options.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestError('File type not allowed');
    }
  }

  private generateFilePath(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 15);
    return path.join(this.options.uploadPath, `${timestamp}-${random}${ext}`);
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
