import { Router } from 'express';
import { DataSource } from 'typeorm';
import { SLAController } from '../controllers/sla.controller';
import { SLAService } from '../services/sla/adapters/input/sla.service';
import { SLARepository } from '../services/sla/adapters/output/sla.repository';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';

export function createSlaRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Inicializar dependencias
  const slaRepository = new SLARepository(dataSource);
  const slaService = new SLAService(slaRepository);
  const slaController = new SLAController(slaService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Middleware de autenticación para todas las rutas
  router.use(authMiddleware.authenticate);

  // Rutas para administradores
  router.post('/', authMiddleware.hasRole(['admin']), slaController.createSLA.bind(slaController));

  router.put(
    '/:id',
    authMiddleware.hasRole(['admin']),
    slaController.updateSLA.bind(slaController)
  );

  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    slaController.deleteSLA.bind(slaController)
  );

  // Rutas para administradores y operadores
  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.getSLAs.bind(slaController)
  );

  router.get(
    '/active',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.getActiveSLAs.bind(slaController)
  );

  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.getSLAById.bind(slaController)
  );

  router.get(
    '/zone/:zoneId',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.getSLAsByZone.bind(slaController)
  );

  router.get(
    '/client/:clientId',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.getSLAsByClient.bind(slaController)
  );

  // Rutas para análisis de cumplimiento
  router.post(
    '/compliance',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.calculateCompliance.bind(slaController)
  );

  router.post(
    '/validate',
    authMiddleware.hasRole(['admin', 'operator']),
    slaController.validateSLA.bind(slaController)
  );

  return router;
}
