import { DataSource } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Attachment } from '../../domain/entities/attachment.entity';
import { DEFAULT_FILE_STORAGE_OPTIONS } from '../../services/files';
import { createLogger } from '../../config/logger.config';

const logger = createLogger('cleanup-temp-files');

export async function cleanupTempFiles(dataSource: DataSource) {
  try {
    logger.info('Iniciando limpieza de archivos temporales...');

    const tempDir = path.join(DEFAULT_FILE_STORAGE_OPTIONS.uploadPath, 'temp');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Listar todos los archivos en el directorio temporal
    const files = await fs.readdir(tempDir);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      // Si el archivo tiene más de 24 horas, verificar si está en uso
      if (stats.mtime < twentyFourHoursAgo) {
        // Verificar si el archivo está referenciado en la base de datos
        const attachment = await dataSource.getRepository(Attachment).findOne({
          where: { file_path: filePath }
        });

        if (!attachment) {
          // El archivo no está en uso, eliminarlo
          await fs.unlink(filePath);
          logger.info(`Archivo temporal eliminado: ${filePath}`);
        }
      }
    }

    logger.info('Limpieza de archivos temporales completada');
  } catch (error) {
    logger.error('Error durante la limpieza de archivos temporales:', error);
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
      return cleanupTempFiles(dataSource);
    })
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('Error ejecutando script:', error);
      process.exit(1);
    });
}
