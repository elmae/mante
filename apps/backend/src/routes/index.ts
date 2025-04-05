import { Router } from 'express';
import { DataSource } from 'typeorm';
import { createUserRouter } from './user.routes';
import { createAuthRouter } from './auth.routes';
import { createAtmRouter } from './atm.routes';
import { createTicketRouter } from './ticket.routes';
import { createMaintenanceRouter } from './maintenance.routes';
import { createSlaRouter } from './sla.routes';
import { createClientRouter } from './client.routes';

export function createRoutes(dataSource: DataSource): Router {
  const router = Router();

  // Rutas públicas y de autenticación
  router.use('/auth', createAuthRouter(dataSource));

  // Rutas protegidas
  router.use('/users', createUserRouter(dataSource));
  router.use('/atms', createAtmRouter(dataSource));
  router.use('/tickets', createTicketRouter(dataSource));
  router.use('/maintenance', createMaintenanceRouter(dataSource));
  router.use('/sla', createSlaRouter(dataSource));
  router.use('/clients', createClientRouter(dataSource));

  return router;
}

export default createRoutes;
