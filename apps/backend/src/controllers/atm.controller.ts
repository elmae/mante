import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { AtmService } from "../services/atm/adapters/input/atm.service";
import {
  CreateAtmDto,
  TechnicalSpecsDto,
} from "../services/atm/dtos/create-atm.dto";
import {
  UpdateAtmDto,
  LocationQueryDto,
} from "../services/atm/dtos/update-atm.dto";
import { Point } from "geojson";
import { ATM } from "../domain/entities/atm.entity";

type TechnicalSpecs = {
  cpu: string;
  memory: string;
  os: string;
  cash_capacity: number;
  supported_transactions: string[];
  [key: string]: any;
};

export class AtmController {
  constructor(private readonly atmService: AtmService) {}

  private async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new Error(
        errors.map((error) => Object.values(error.constraints || {})).join(", ")
      );
    }
  }

  private validateTechnicalSpecs(specs: TechnicalSpecsDto): TechnicalSpecs {
    if (
      !specs.cpu ||
      !specs.memory ||
      !specs.os ||
      !specs.cash_capacity ||
      !specs.supported_transactions
    ) {
      throw new Error("Missing required technical specifications");
    }
    return {
      cpu: specs.cpu,
      memory: specs.memory,
      os: specs.os,
      cash_capacity: specs.cash_capacity,
      supported_transactions: specs.supported_transactions,
    };
  }

  async createAtm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const createAtmDto = plainToClass(CreateAtmDto, req.body);
      await this.validateDto(createAtmDto);

      const technical_specs = this.validateTechnicalSpecs(
        createAtmDto.technical_specs
      );

      const atmData = {
        serial_number: createAtmDto.serial_number,
        model: createAtmDto.model,
        brand: createAtmDto.brand,
        location: createAtmDto.location,
        address: createAtmDto.address,
        technical_specs,
        client_id: createAtmDto.client_id,
        zone_id: createAtmDto.zone_id,
        is_active: createAtmDto.is_active,
      };

      const atm = await this.atmService.create(atmData);
      res.status(201).json(atm);
    } catch (error) {
      next(error);
    }
  }

  async updateAtm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updateAtmDto = plainToClass(UpdateAtmDto, req.body);
      await this.validateDto(updateAtmDto);

      const existingAtm = await this.atmService.findById(req.params.id);
      if (!existingAtm) {
        res.status(404).json({ message: "ATM not found" });
        return;
      }

      const atmData: Partial<ATM> = {};

      // Copiar solo las propiedades definidas
      if (updateAtmDto.serial_number)
        atmData.serial_number = updateAtmDto.serial_number;
      if (updateAtmDto.model) atmData.model = updateAtmDto.model;
      if (updateAtmDto.brand) atmData.brand = updateAtmDto.brand;
      if (updateAtmDto.location) atmData.location = updateAtmDto.location;
      if (updateAtmDto.address) atmData.address = updateAtmDto.address;
      if (updateAtmDto.client_id) atmData.client_id = updateAtmDto.client_id;
      if (updateAtmDto.zone_id) atmData.zone_id = updateAtmDto.zone_id;
      if (typeof updateAtmDto.is_active !== "undefined")
        atmData.is_active = updateAtmDto.is_active;

      if (updateAtmDto.technical_specs) {
        atmData.technical_specs = {
          ...existingAtm.technical_specs,
          ...Object.entries(updateAtmDto.technical_specs)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        } as TechnicalSpecs;
      }

      const atm = await this.atmService.update(req.params.id, atmData);
      res.json(atm);
    } catch (error) {
      next(error);
    }
  }

  async getAtms(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { atms, total } = await this.atmService.list(page, limit);
      res.json({
        data: atms,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAtmById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const atm = await this.atmService.findById(req.params.id);
      if (!atm) {
        res.status(404).json({ message: "ATM not found" });
        return;
      }
      res.json(atm);
    } catch (error) {
      next(error);
    }
  }

  async deleteAtm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.atmService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async findByLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const locationQuery = plainToClass(LocationQueryDto, req.query);
      await this.validateDto(locationQuery);

      const point: Point = {
        type: "Point",
        coordinates: [locationQuery.longitude, locationQuery.latitude],
      };

      const atms = await this.atmService.findByLocation(
        point,
        locationQuery.radius
      );
      res.json(atms);
    } catch (error) {
      next(error);
    }
  }

  async getAtmStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const [status, lastMaintenance, uptime] = await Promise.all([
        this.atmService.getStatus(req.params.id),
        this.atmService.getLastMaintenance(req.params.id),
        this.atmService.getUptime(req.params.id),
      ]);

      res.json({
        status,
        last_maintenance: lastMaintenance,
        uptime,
        needs_maintenance: await this.atmService.checkMaintenance(
          req.params.id
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  async findByClient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const atms = await this.atmService.findByClient(req.params.clientId);
      res.json(atms);
    } catch (error) {
      next(error);
    }
  }

  async findByZone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const atms = await this.atmService.findByZone(req.params.zoneId);
      res.json(atms);
    } catch (error) {
      next(error);
    }
  }
}
