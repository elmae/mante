import { Router } from 'express';
import { AtmController } from '../controllers/atm.controller';
import { AtmService } from '../services/atm/adapters/input/atm.service';
import { AtmRepository } from '../services/atm/adapters/output/atm.repository';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { DataSource } from 'typeorm';

export function createAtmRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Inicializar dependencias
  const atmRepository = new AtmRepository(dataSource);
  const atmService = new AtmService(atmRepository);
  const atmController = new AtmController(atmService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Rutas protegidas - Solo administradores pueden gestionar ATMs
  router.post('/', authMiddleware.hasRole(['admin']), atmController.createAtm.bind(atmController));

  router.put(
    '/:id',
    authMiddleware.hasRole(['admin']),
    atmController.updateAtm.bind(atmController)
  );

  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    atmController.deleteAtm.bind(atmController)
  );

  // Rutas de consulta - Accesibles para administradores y operadores
  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.getAtms.bind(atmController)
  );

  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.getAtmById.bind(atmController)
  );

  router.get(
    '/location/search',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.findByLocation.bind(atmController)
  );

  router.get(
    '/:id/status',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.getAtmStatus.bind(atmController)
  );

  // Rutas para búsquedas específicas
  router.get(
    '/client/:clientId',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.findByClient.bind(atmController)
  );

  router.get(
    '/zone/:zoneId',
    authMiddleware.hasRole(['admin', 'operator']),
    atmController.findByZone.bind(atmController)
  );

  return router;
}
