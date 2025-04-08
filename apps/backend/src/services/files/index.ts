import { FileStorageOptions, RetentionPolicyRule } from './ports/input/files.port';

// Puertos
export { IFilesPort, FileStorageOptions, RetentionPolicyRule } from './ports/input/files.port';
export {
  IStoragePort,
  IAuditLogPort,
  IAttachmentRepositoryPort,
  FileOperationLog,
  AttachmentData,
  RetentionRule
} from './ports/output/storage.port';

// Adaptadores
export { FilesService } from './adapters/input/files.service';
export { LocalStorageAdapter } from './adapters/output/local-storage.adapter';
export { AttachmentRepository } from './adapters/output/attachment.repository';
export { AuditLogRepository } from './adapters/output/audit-log.repository';

// Configuración por defecto
export const DEFAULT_FILE_STORAGE_OPTIONS: FileStorageOptions = {
  maxSizeInBytes: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  uploadPath: 'uploads',
  recycleBinPath: 'uploads/.recycle',
  recycleBinRetentionDays: 30,
  recycleBinMaxSize: 500 * 1024 * 1024 // 500MB
};

export const DEFAULT_RETENTION_RULES: RetentionPolicyRule[] = [
  {
    mimeTypePattern: /^image\//,
    parentType: 'ticket',
    parentStatus: ['closed', 'resolved'],
    retentionDays: 90 // 3 meses
  },
  {
    mimeTypePattern: /^application\/(pdf|msword|vnd\.openxmlformats-officedocument)/,
    parentType: 'ticket',
    parentStatus: ['closed', 'resolved'],
    retentionDays: 730 // 2 años
  }
];
