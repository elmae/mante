import { Router } from 'express';
import { DataSource } from 'typeorm';
import { AtmController } from '../controllers/atm.controller';
import { AtmService } from '../services/atm/atm.service';
import { AtmRepository } from '../services/atm/adapters/output/atm.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';
import { ROLES } from '../decorators/roles.decorator';

export function createAtmRouter(dataSource: DataSource): Router {
  const router = Router();
  const atmRepository = new AtmRepository(dataSource);
  const atmService = new AtmService(atmRepository);
  const atmController = new AtmController(atmService);

  // POST /atms - Crear nuevo ATM
  router.post('/', authMiddleware, roleGuard([ROLES.ADMIN, ROLES.MANAGER]), (req, res, next) =>
    atmController.create(req, res, next)
  );

  // GET /atms - Listar ATMs con filtros
  router.get(
    '/',
    authMiddleware,
    roleGuard([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.VIEWER]),
    (req, res, next) => atmController.findAll(req, res, next)
  );

  // GET /atms/:id - Obtener ATM específico
  router.get(
    '/:id',
    authMiddleware,
    roleGuard([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.VIEWER]),
    (req, res, next) => atmController.findOne(req, res, next)
  );

  // PUT /atms/:id - Actualizar ATM
  router.put('/:id', authMiddleware, roleGuard([ROLES.ADMIN, ROLES.MANAGER]), (req, res, next) =>
    atmController.update(req, res, next)
  );

  // DELETE /atms/:id - Eliminar ATM
  router.delete('/:id', authMiddleware, roleGuard([ROLES.ADMIN]), (req, res, next) =>
    atmController.remove(req, res, next)
  );

  // GET /atms/proximity/search - Buscar ATMs por proximidad
  router.get(
    '/proximity/search',
    authMiddleware,
    roleGuard([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.VIEWER]),
    (req, res, next) => atmController.findByProximity(req, res, next)
  );

  return router;
}
