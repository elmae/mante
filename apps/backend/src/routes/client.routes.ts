import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { ClientService } from '../services/client/adapters/input/client.service';
import { ClientRepository } from '../services/client/adapters/output/client.repository';
import { DataSource } from 'typeorm';
import { Client } from '../domain/entities/client.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createClientRouter(dataSource: DataSource): Router {
  const router = Router();
  const clientRepository = new ClientRepository(dataSource.getRepository(Client));
  const clientService = new ClientService(clientRepository);
  const clientController = new ClientController(clientService);

  router.get('/', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    clientController.findAll(req, res, next)
  );

  router.get('/:id', AuthMiddleware.requireAnyRole(['admin', 'operator']), (req, res, next) =>
    clientController.findById(req, res, next)
  );

  router.get(
    '/email/:email',
    AuthMiddleware.requireAnyRole(['admin', 'operator']),
    (req, res, next) => clientController.findByEmail(req, res, next)
  );

  router.post('/', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    clientController.create(req, res, next)
  );

  router.patch('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    clientController.update(req, res, next)
  );

  router.delete('/:id', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    clientController.delete(req, res, next)
  );

  router.patch('/:id/activate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    clientController.activate(req, res, next)
  );

  router.patch('/:id/deactivate', AuthMiddleware.requireRole('admin'), (req, res, next) =>
    clientController.deactivate(req, res, next)
  );

  return router;
}
