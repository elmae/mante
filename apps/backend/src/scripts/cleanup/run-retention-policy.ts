import { DataSource } from 'typeorm';
import { FilesService } from '../../services/files';
import { LocalStorageAdapter } from '../../services/files/adapters/output/local-storage.adapter';
import { AttachmentRepository } from '../../services/files/adapters/output/attachment.repository';
import { AuditLogRepository } from '../../services/files/adapters/output/audit-log.repository';
import { DEFAULT_FILE_STORAGE_OPTIONS, DEFAULT_RETENTION_RULES } from '../../services/files';
import { createLogger } from '../../config/logger.config';

const logger = createLogger('retention-policy');

export async function runRetentionPolicy(dataSource: DataSource) {
  try {
    logger.info('Iniciando ejecución de política de retención...');

    // Inicializar servicios necesarios
    const storageAdapter = new LocalStorageAdapter(DEFAULT_FILE_STORAGE_OPTIONS.uploadPath);
    const attachmentRepository = new AttachmentRepository(dataSource);
    const auditLogRepository = new AuditLogRepository(dataSource);

    const filesService = new FilesService(
      storageAdapter,
      attachmentRepository,
      auditLogRepository,
      DEFAULT_FILE_STORAGE_OPTIONS,
      DEFAULT_RETENTION_RULES
    );

    // Ejecutar política de retención
    logger.info('Aplicando reglas de retención...');
    await filesService.runRetentionPolicy();

    // Limpiar papelera
    logger.info('Limpiando papelera de reciclaje...');
    const recycleBinSize = await storageAdapter.getDirectorySize(
      DEFAULT_FILE_STORAGE_OPTIONS.recycleBinPath
    );

    if (recycleBinSize > DEFAULT_FILE_STORAGE_OPTIONS.recycleBinMaxSize) {
      logger.warn(
        `Papelera excede el tamaño máximo permitido (${Math.round(
          recycleBinSize / 1024 / 1024
        )}MB/${Math.round(DEFAULT_FILE_STORAGE_OPTIONS.recycleBinMaxSize / 1024 / 1024)}MB)`
      );
      await filesService.cleanupRecycleBin();
    }

    logger.info('Política de retención ejecutada exitosamente');
  } catch (error) {
    logger.error('Error durante la ejecución de la política de retención:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL
  });

  dataSource
    .initialize()
    .then(() => {
      return runRetentionPolicy(dataSource);
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('Error ejecutando script:', error);
      process.exit(1);
    });
}
