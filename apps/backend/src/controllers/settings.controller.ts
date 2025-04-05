import { Request, Response, NextFunction } from 'express';
import { SettingsPort } from '../services/settings/ports/input/settings.port';
import { CreateSettingDto } from '../services/settings/dtos/create-setting.dto';
import { UpdateSettingDto } from '../services/settings/dtos/update-setting.dto';
import { ValidationException } from '../common/exceptions/validation.exception';
import { SettingScope } from '../domain/entities/settings.entity';

export class SettingsController {
  constructor(private readonly settingsService: SettingsPort) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createSettingDto = req.body as CreateSettingDto;
      const userId = req.user?.id as string;
      const result = await this.settingsService.create(createSettingDto, userId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting key already exists') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'key',
                constraints: { unique: 'Setting key already exists' }
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
      const updateSettingDto = req.body as UpdateSettingDto;
      const userId = req.user?.id as string;
      const result = await this.settingsService.update(req.params.id, updateSettingDto, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting not found') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Setting not found' }
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
      const settings = await this.settingsService.findAll();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const setting = await this.settingsService.findById(req.params.id);
      res.json(setting);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting not found') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Setting not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async findByScope(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scope = req.params.scope as SettingScope;
      const settings = await this.settingsService.findByScope(scope);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async getValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const value = await this.settingsService.getValue(req.params.key);
      if (value === null) {
        next(
          new ValidationException('Setting validation failed', [
            {
              property: 'key',
              constraints: { exists: 'Setting key not found' }
            }
          ])
        );
        return;
      }
      res.json({ value });
    } catch (error) {
      next(error);
    }
  }

  async getValuesByScope(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scope = req.params.scope as SettingScope;
      const values = await this.settingsService.getValuesByScope(scope);
      res.json(values);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.settingsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting not found') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Setting not found' }
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
      await this.settingsService.activate(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting not found') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Setting not found' }
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
      await this.settingsService.deactivate(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Setting not found') {
          next(
            new ValidationException('Setting validation failed', [
              {
                property: 'id',
                constraints: { exists: 'Setting not found' }
              }
            ])
          );
          return;
        }
      }
      next(error);
    }
  }

  async bulkUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id as string;
      await this.settingsService.bulkUpdate(req.body, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        next(
          new ValidationException('Setting validation failed', [
            {
              property: 'settings',
              constraints: { invalid: error.message }
            }
          ])
        );
        return;
      }
      next(error);
    }
  }
}
