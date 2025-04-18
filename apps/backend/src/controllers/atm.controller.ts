import { Request, Response, NextFunction } from 'express';
import { AtmService } from '../services/atm/atm.service';
import { CreateAtmDto } from '../domain/dtos/atm/create-atm.dto';
import { UpdateAtmDto } from '../domain/dtos/atm/update-atm.dto';
import { FilterAtmDto } from '../domain/dtos/atm/filter-atm.dto';
import { AuthenticatedRequest } from '../types/express';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class AtmController {
  constructor(private readonly atmService: AtmService) {}

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const createAtmDto = plainToInstance(CreateAtmDto, req.body);
      await validateOrReject(createAtmDto);

      const result = await this.atmService.create(createAtmDto, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filterDto = plainToInstance(FilterAtmDto, req.query);
      await validateOrReject(filterDto);

      const [atms, total] = await this.atmService.findAll(filterDto);
      res.json({
        data: atms,
        total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        totalPages: Math.ceil(total / (filterDto.limit || 10))
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.atmService.findOne(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updateAtmDto = plainToInstance(UpdateAtmDto, req.body);
      await validateOrReject(updateAtmDto);

      const result = await this.atmService.update(req.params.id, updateAtmDto, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await this.atmService.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async findByProximity(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude, radius = 5 } = req.query;

      const result = await this.atmService.findByProximity(
        Number(latitude),
        Number(longitude),
        Number(radius)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
