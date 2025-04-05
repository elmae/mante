import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { SettingsService } from '../services/settings/adapters/input/settings.service';
import { SettingsRepository } from '../services/settings/adapters/output/settings.repository';
import { DataSource } from 'typeorm';
import { Setting } from '../domain/entities/settings.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createSettingsRouter(dataSource: DataSource): Router {
  const router = Router();
  const settingsRepository = new SettingsRepository(dataSource.getRepository(Setting));
  const settingsService = new SettingsService(settingsRepository);
  const settingsController = new SettingsController(settingsService);

  // Crear configuración (solo admin)
  router.post('/', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.create(req, res, next)
  );

  // Actualizar configuración (solo admin)
  router.patch('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.update(req, res, next)
  );

  // Obtener todas las configuraciones (admin y operator)
  router.get('/', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    settingsController.findAll(req, res, next)
  );

  // Obtener configuración por ID (admin y operator)
  router.get('/:id', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    settingsController.findById(req, res, next)
  );

  // Obtener configuraciones por scope (admin y operator)
  router.get(
    '/scope/:scope',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.findByScope(req, res, next)
  );

  // Obtener valor de configuración por clave (admin y operator)
  router.get(
    '/value/:key',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.getValue(req, res, next)
  );

  // Obtener valores de configuración por scope (admin y operator)
  router.get(
    '/values/:scope',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.getValuesByScope(req, res, next)
  );

  // Eliminar configuración (solo admin)
  router.delete('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.delete(req, res, next)
  );

  // Activar configuración (solo admin)
  router.patch('/:id/activate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.activate(req, res, next)
  );

  // Desactivar configuración (solo admin)
  router.patch('/:id/deactivate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.deactivate(req, res, next)
  );

  // Actualización en lote (solo admin)
  router.post('/bulk', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.bulkUpdate(req, res, next)
  );

  return router;
}
import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { SettingsService } from '../services/settings/adapters/input/settings.service';
import { SettingsRepository } from '../services/settings/adapters/output/settings.repository';
import { DataSource } from 'typeorm';
import { Setting } from '../domain/entities/settings.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { CreateSettingDto } from '../services/settings/dtos/create-setting.dto';
import { UpdateSettingDto } from '../services/settings/dtos/update-setting.dto';

export function createSettingsRouter(dataSource: DataSource): Router {
  const router = Router();
  const settingsRepository = new SettingsRepository(dataSource.getRepository(Setting));
  const settingsService = new SettingsService(settingsRepository);
  const settingsController = new SettingsController(settingsService);

  // Crear configuración (solo admin)
  router.post('/', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.create(req, res, next)
  );

  // Actualizar configuración (solo admin)
  router.patch('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.update(req, res, next)
  );

  // Obtener todas las configuraciones (admin y operator)
  router.get('/', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    settingsController.findAll(req, res, next)
  );

  // Obtener configuración por ID (admin y operator)
  router.get('/:id', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    settingsController.findById(req, res, next)
  );

  // Obtener configuraciones por scope (admin y operator)
  router.get(
    '/scope/:scope',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.findByScope(req, res, next)
  );

  // Obtener valor de configuración por clave (admin y operator)
  router.get(
    '/value/:key',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.getValue(req, res, next)
  );

  // Obtener valores de configuración por scope (admin y operator)
  router.get(
    '/values/:scope',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => settingsController.getValuesByScope(req, res, next)
  );

  // Eliminar configuración (solo admin)
  router.delete('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.delete(req, res, next)
  );

  // Activar configuración (solo admin)
  router.patch('/:id/activate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.activate(req, res, next)
  );

  // Desactivar configuración (solo admin)
  router.patch('/:id/deactivate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.deactivate(req, res, next)
  );

  // Actualización en lote (solo admin)
  router.post('/bulk', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    settingsController.bulkUpdate(req, res, next)
  );

  return router;
}
