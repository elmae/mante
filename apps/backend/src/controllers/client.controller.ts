import { Request, Response, NextFunction } from 'express';
import { ClientPort } from '../services/client/ports/input/client.port';
import { CreateClientDto } from '../services/client/dtos/create-client.dto';
import { UpdateClientDto } from '../services/client/dtos/update-client.dto';
import { ValidationException } from '../common/exceptions/validation.exception';

export class ClientController {
  constructor(private readonly clientService: ClientPort) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createClientDto = req.body as CreateClientDto;
      const userId = req.user?.id as string;
      const result = await this.clientService.create(createClientDto, userId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email already exists') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'contact_email',
                constraints: { unique: 'Email already exists' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateClientDto = req.body as UpdateClientDto;
      const userId = req.user?.id as string;
      const result = await this.clientService.update(req.params.id, updateClientDto, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Client not found') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Client not found' }
              }
            ])
          );
          return;
        }
        if (error.message === 'Email already exists') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'contact_email',
                constraints: { unique: 'Email already exists' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await this.clientService.findAll();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await this.clientService.findById(req.params.id);
      res.json(client);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Client not found') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Client not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async findByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await this.clientService.findByEmail(req.params.email);
      if (!client) {
        next(
          new ValidationException('Client validation failed', [
            {
              property: 'email',
              constraints: { exists: 'Client not found' }
            }
          ])
        );
        return;
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.clientService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Client not found') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Client not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      await this.clientService.activate(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Client not found') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Client not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      await this.clientService.deactivate(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Client not found') {
          next(
            new ValidationException('Client validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Client not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }
}
