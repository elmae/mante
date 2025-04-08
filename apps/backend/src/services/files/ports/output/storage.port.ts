/**
 * Puerto de salida para el almacenamiento de archivos
 * Define las operaciones que debe implementar cualquier proveedor de almacenamiento
 */
export interface IStoragePort {
  // Operaciones principales
  saveFile(file: Express.Multer.File, destinationPath: string): Promise<SaveFileResult>;
  getFile(filePath: string): Promise<GetFileResult>;
  deleteFile(filePath: string): Promise<void>;
  moveFile(sourcePath: string, destinationPath: string): Promise<void>;

  // Operaciones de consulta
  fileExists(filePath: string): Promise<boolean>;
  getFileSize(filePath: string): Promise<number>;

  // Operaciones de mantenimiento
  deleteDirectory(directoryPath: string): Promise<void>;
  createDirectory(directoryPath: string): Promise<void>;
  listFiles(directoryPath: string): Promise<string[]>;
  getDirectorySize(directoryPath: string): Promise<number>;
}

export type SaveFileResult = {
  path: string;
  size: number;
  mimeType: string;
};

export type GetFileResult = {
  stream: NodeJS.ReadableStream;
  size: number;
  mimeType: string;
};

/**
 * Interfaz para el repositorio de logs de auditoría
 */
export interface IAuditLogPort {
  logFileOperation(data: FileOperationLog): Promise<void>;
  getFileOperations(fileId: string): Promise<FileOperationLog[]>;
}

export type FileOperationLog = {
  fileId: string;
  operation: 'upload' | 'download' | 'delete' | 'restore' | 'move_to_recycle' | 'permanent_delete';
  userId: string;
  timestamp: Date;
  details?: Record<string, any>;
};

/**
 * Interfaz para el repositorio de archivos en la base de datos
 */
export interface IAttachmentRepositoryPort {
  save(data: AttachmentData): Promise<AttachmentData>;
  update(id: string, data: Partial<AttachmentData>): Promise<AttachmentData>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AttachmentData | null>;
  findByParent(parentType: string, parentId: string): Promise<AttachmentData[]>;
  markAsDeleted(id: string): Promise<void>;
  markAsRestored(id: string): Promise<void>;
  getDeletedByUser(userId: string): Promise<AttachmentData[]>;
  getExpiredFiles(rules: RetentionRule[]): Promise<AttachmentData[]>;
}

export type AttachmentData = {
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
};

export type RetentionRule = {
  mimeTypePattern: RegExp;
  parentType?: string;
  parentStatus?: string[];
  retentionDays: number;
};
