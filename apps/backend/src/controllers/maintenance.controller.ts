import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { MaintenanceService } from "../services/maintenance/adapters/input/maintenance.service";
import {
  StartMaintenanceDto,
  CompleteMaintenanceDto,
  AddPartsDto,
  MaintenanceFilterDto,
} from "../services/maintenance/dtos/maintenance.dto";
import { User } from "../domain/entities/user.entity";

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  private async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new Error(
        errors.map((error) => Object.values(error.constraints || {})).join(", ")
      );
    }
  }

  async createMaintenance(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const maintenanceDto = plainToClass(StartMaintenanceDto, req.body);
      await this.validateDto(maintenanceDto);

      const maintenance = await this.maintenanceService.create({
        ...maintenanceDto,
        created_by: { id: req.user?.sub } as User,
      });

      res.status(201).json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async startMaintenance(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { ticketId } = req.params;
      const technicianId = req.body.technician_id || req.user?.sub;

      const maintenance = await this.maintenanceService.startMaintenance(
        ticketId,
        technicianId
      );
      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async completeMaintenance(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const completionDto = plainToClass(CompleteMaintenanceDto, req.body);
      await this.validateDto(completionDto);

      if (!completionDto.end_time) {
        completionDto.end_time = new Date();
      }

      const maintenance = await this.maintenanceService.completeMaintenance(
        req.params.id,
        completionDto
      );

      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async addParts(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const partsDto = plainToClass(AddPartsDto, req.body);
      await this.validateDto(partsDto);

      const maintenance = await this.maintenanceService.addParts(
        req.params.id,
        partsDto.parts
      );

      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async getMaintenance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const maintenance = await this.maintenanceService.findById(req.params.id);
      if (!maintenance) {
        res.status(404).json({ message: "Maintenance record not found" });
        return;
      }
      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  }

  async listMaintenances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDto = plainToClass(MaintenanceFilterDto, req.query);
      await this.validateDto(filterDto);

      const { records, total } = await this.maintenanceService.list(filterDto);

      res.json({
        data: records,
        meta: {
          total,
          page: filterDto.page || 1,
          limit: filterDto.limit || 10,
          pages: Math.ceil(total / (filterDto.limit || 10)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMaintenancesByATM(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const maintenances = await this.maintenanceService.findByATM(
        req.params.atmId
      );
      res.json(maintenances);
    } catch (error) {
      next(error);
    }
  }

  async getMaintenancesByTechnician(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const maintenances = await this.maintenanceService.findByTechnician(
        req.params.technicianId
      );
      res.json(maintenances);
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDto = plainToClass(MaintenanceFilterDto, req.query);
      await this.validateDto(filterDto);

      const stats = await this.maintenanceService.getMaintenanceStats(
        filterDto
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getInProgressMaintenances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const maintenances = await this.maintenanceService.findInProgress();
      res.json(maintenances);
    } catch (error) {
      next(error);
    }
  }

  async deleteMaintenance(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.maintenanceService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
