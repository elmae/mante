import { DataSource, Repository, Between, In } from 'typeorm';
import { IAuditLogPort, FileOperationLog } from '../../ports/output/storage.port';

/**
 * Entidad para el registro de auditoría de operaciones con archivos
 */
class FileAuditLog {
  id: string;
  file_id: string;
  operation: string;
  user_id: string;
  timestamp: Date;
  details: Record<string, any>;
}

export class AuditLogRepository implements IAuditLogPort {
  private repository: Repository<FileAuditLog>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(FileAuditLog);
  }

  async logFileOperation(data: FileOperationLog): Promise<void> {
    const log = this.repository.create({
      id: crypto.randomUUID(),
      file_id: data.fileId,
      operation: data.operation,
      user_id: data.userId,
      timestamp: data.timestamp,
      details: data.details || {}
    });

    await this.repository.save(log);
  }

  async getFileOperations(fileId: string): Promise<FileOperationLog[]> {
    const logs = await this.repository.find({
      where: { file_id: fileId },
      order: { timestamp: 'DESC' }
    });

    return logs.map(log => ({
      fileId: log.file_id,
      operation: log.operation as FileOperationLog['operation'],
      userId: log.user_id,
      timestamp: log.timestamp,
      details: log.details
    }));
  }

  /**
   * Obtiene las operaciones de un archivo en un rango de fechas específico
   */
  async getFileOperationsInDateRange(
    fileId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FileOperationLog[]> {
    const logs = await this.repository.find({
      where: {
        file_id: fileId,
        timestamp: Between(startDate, endDate)
      },
      order: { timestamp: 'DESC' }
    });

    return logs.map(log => ({
      fileId: log.file_id,
      operation: log.operation as FileOperationLog['operation'],
      userId: log.user_id,
      timestamp: log.timestamp,
      details: log.details
    }));
  }

  /**
   * Obtiene las operaciones realizadas por un usuario específico
   */
  async getUserOperations(userId: string): Promise<FileOperationLog[]> {
    const logs = await this.repository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' }
    });

    return logs.map(log => ({
      fileId: log.file_id,
      operation: log.operation as FileOperationLog['operation'],
      userId: log.user_id,
      timestamp: log.timestamp,
      details: log.details
    }));
  }

  /**
   * Obtiene las operaciones de eliminación de archivos
   * Útil para auditar la política de retención
   */
  async getDeletionOperations(startDate: Date, endDate: Date): Promise<FileOperationLog[]> {
    const logs = await this.repository.find({
      where: {
        operation: In(['delete', 'move_to_recycle', 'permanent_delete']),
        timestamp: Between(startDate, endDate)
      },
      order: { timestamp: 'DESC' }
    });

    return logs.map(log => ({
      fileId: log.file_id,
      operation: log.operation as FileOperationLog['operation'],
      userId: log.user_id,
      timestamp: log.timestamp,
      details: log.details
    }));
  }
}
