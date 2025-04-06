import cron from 'node-cron';
import { DataSource } from 'typeorm';
import { cleanupTempFiles } from '../scripts/cleanup/cleanup-temp-files';
import { runRetentionPolicy } from '../scripts/cleanup/run-retention-policy';
import { createLogger } from './logger.config';

const logger = createLogger('cron-jobs');

export function setupCronJobs(dataSource: DataSource) {
  // Limpiar archivos temporales cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Iniciando limpieza programada de archivos temporales');
      await cleanupTempFiles(dataSource);
      logger.info('Limpieza de archivos temporales completada');
    } catch (error) {
      logger.error('Error en la limpieza de archivos temporales:', error);
    }
  });

  // Ejecutar política de retención cada día a las 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Iniciando ejecución programada de política de retención');
      await runRetentionPolicy(dataSource);
      logger.info('Ejecución de política de retención completada');
    } catch (error) {
      logger.error('Error en la ejecución de política de retención:', error);
    }
  });

  // Limpiar papelera de reciclaje cada día a las 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Iniciando limpieza programada de papelera de reciclaje');
      await runRetentionPolicy(dataSource);
      logger.info('Limpieza de papelera de reciclaje completada');
    } catch (error) {
      logger.error('Error en la limpieza de papelera de reciclaje:', error);
    }
  });

  logger.info('Trabajos programados configurados exitosamente');
}

// Tipos de expresiones cron disponibles:
// * * * * * - cada minuto
// 0 * * * * - cada hora
// 0 0 * * * - cada día a medianoche
// 0 */6 * * * - cada 6 horas
// 0 0 * * 0 - cada domingo a medianoche
// 0 0 1 * * - primer día del mes a medianoche
