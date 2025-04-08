import { CreateAttachmentDto, AttachmentResponseDto } from '../../../../domain/dtos/attachment.dto';

/**
 * Puerto de entrada para el servicio de archivos
 * Define las operaciones disponibles para la gestión de archivos
 */
export interface IFilesPort {
  // Operaciones principales
  uploadFile(
    file: Express.Multer.File,
    userId: string,
    dto: CreateAttachmentDto
  ): Promise<AttachmentResponseDto>;
  downloadFile(
    fileId: string
  ): Promise<{ stream: NodeJS.ReadableStream; attachment: AttachmentResponseDto }>;
  deleteFile(fileId: string, userId: string): Promise<void>;

  // Operaciones de la papelera de reciclaje
  restoreFile(fileId: string, userId: string): Promise<AttachmentResponseDto>;
  emptyRecycleBin(userId: string): Promise<void>;

  // Operaciones de consulta
  getFileInfo(fileId: string): Promise<AttachmentResponseDto>;
  getFilesByParent(
    parentType: 'ticket' | 'maintenance',
    parentId: string
  ): Promise<AttachmentResponseDto[]>;
  getDeletedFiles(userId: string): Promise<AttachmentResponseDto[]>;

  // Operaciones de mantenimiento
  runRetentionPolicy(): Promise<void>;
  cleanupRecycleBin(): Promise<void>;
}

export type FileStorageOptions = {
  maxSizeInBytes: number;
  allowedMimeTypes: string[];
  uploadPath: string;
  recycleBinPath: string;
  recycleBinRetentionDays: number;
  recycleBinMaxSize: number; // en bytes
};

export type RetentionPolicyRule = {
  mimeTypePattern: RegExp;
  parentType: 'ticket' | 'maintenance' | '*';
  parentStatus: string[];
  retentionDays: number;
};
