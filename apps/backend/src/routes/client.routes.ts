import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { ClientService } from '../services/client/adapters/input/client.service';
import { ClientRepository } from '../services/client/adapters/output/client.repository';
import { DataSource } from 'typeorm';
import { Client } from '../domain/entities/client.entity';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';

export function createClientRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();
  const clientRepository = new ClientRepository(dataSource.getRepository(Client));
  const clientService = new ClientService(clientRepository);
  const clientController = new ClientController(clientService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    clientController.findAll.bind(clientController)
  );

  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator']),
    clientController.findById.bind(clientController)
  );

  router.get(
    '/email/:email',
    authMiddleware.hasRole(['admin', 'operator']),
    clientController.findByEmail.bind(clientController)
  );

  router.post(
    '/',
    authMiddleware.hasRole(['admin']),
    clientController.create.bind(clientController)
  );

  router.patch(
    '/:id',
    authMiddleware.hasRole(['admin']),
    clientController.update.bind(clientController)
  );

  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    clientController.delete.bind(clientController)
  );

  router.patch(
    '/:id/activate',
    authMiddleware.hasRole(['admin']),
    clientController.activate.bind(clientController)
  );

  router.patch(
    '/:id/deactivate',
    authMiddleware.hasRole(['admin']),
    clientController.deactivate.bind(clientController)
  );

  return router;
}
