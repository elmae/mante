import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { SettingsService } from '../services/settings/adapters/input/settings.service';
import { SettingsRepository } from '../services/settings/adapters/output/settings.repository';
import { DataSource } from 'typeorm';
import { Setting } from '../domain/entities/settings.entity';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';

export function createSettingsRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Initialize dependencies
  const settingsRepository = new SettingsRepository(dataSource.getRepository(Setting));
  const settingsService = new SettingsService(settingsRepository);
  const settingsController = new SettingsController(settingsService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Apply auth middleware to all routes
  router.use(authMiddleware.authenticate);

  // Crear configuración (solo admin)
  router.post(
    '/',
    authMiddleware.hasRole(['admin']),
    settingsController.create.bind(settingsController)
  );

  // Actualizar configuración (solo admin)
  router.patch(
    '/:id',
    authMiddleware.hasRole(['admin']),
    settingsController.update.bind(settingsController)
  );

  // Obtener todas las configuraciones (admin y operator)
  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    settingsController.findAll.bind(settingsController)
  );

  // Obtener configuración por ID (admin y operator)
  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator']),
    settingsController.findById.bind(settingsController)
  );

  // Obtener configuraciones por scope (admin y operator)
  router.get(
    '/scope/:scope',
    authMiddleware.hasRole(['admin', 'operator']),
    settingsController.findByScope.bind(settingsController)
  );

  // Obtener valor de configuración por clave (admin y operator)
  router.get(
    '/value/:key',
    authMiddleware.hasRole(['admin', 'operator']),
    settingsController.getValue.bind(settingsController)
  );

  // Obtener valores de configuración por scope (admin y operator)
  router.get(
    '/values/:scope',
    authMiddleware.hasRole(['admin', 'operator']),
    settingsController.getValuesByScope.bind(settingsController)
  );

  // Eliminar configuración (solo admin)
  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    settingsController.delete.bind(settingsController)
  );

  // Activar configuración (solo admin)
  router.patch(
    '/:id/activate',
    authMiddleware.hasRole(['admin']),
    settingsController.activate.bind(settingsController)
  );

  // Desactivar configuración (solo admin)
  router.patch(
    '/:id/deactivate',
    authMiddleware.hasRole(['admin']),
    settingsController.deactivate.bind(settingsController)
  );

  // Actualización en lote (solo admin)
  router.post(
    '/bulk',
    authMiddleware.hasRole(['admin']),
    settingsController.bulkUpdate.bind(settingsController)
  );

  return router;
}
