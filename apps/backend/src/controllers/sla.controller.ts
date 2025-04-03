import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { SLAService } from "../services/sla/adapters/input/sla.service";
import {
  CreateSLAConfigDto,
  UpdateSLAConfigDto,
  SLAFilterDto,
  ComplianceQueryDto,
  SLAValidationRequestDto,
} from "../services/sla/dtos/sla.dto";

interface RequestWithUser extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

export class SLAController {
  constructor(private readonly slaService: SLAService) {}

  private async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new Error(
        errors.map((error) => Object.values(error.constraints || {})).join(", ")
      );
    }
  }

  async createSLA(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const createSLADto = plainToClass(CreateSLAConfigDto, req.body);
      await this.validateDto(createSLADto);

      const sla = await this.slaService.create({
        ...createSLADto,
        created_by: { id: req.user?.sub } as any,
      });

      res.status(201).json(sla);
    } catch (error) {
      next(error);
    }
  }

  async updateSLA(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updateSLADto = plainToClass(UpdateSLAConfigDto, req.body);
      await this.validateDto(updateSLADto);

      const sla = await this.slaService.update(req.params.id, {
        ...updateSLADto,
        updated_by: { id: req.user?.sub } as any,
      });

      res.json(sla);
    } catch (error) {
      next(error);
    }
  }

  async getSLAs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDto = plainToClass(SLAFilterDto, req.query);
      await this.validateDto(filterDto);

      const { configs, total } = await this.slaService.list(filterDto);

      res.json({
        data: configs,
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

  async getSLAById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sla = await this.slaService.findById(req.params.id);
      if (!sla) {
        res.status(404).json({ message: "SLA configuration not found" });
        return;
      }
      res.json(sla);
    } catch (error) {
      next(error);
    }
  }

  async deleteSLA(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.slaService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getSLAsByZone(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slas = await this.slaService.findByZone(req.params.zoneId);
      res.json(slas);
    } catch (error) {
      next(error);
    }
  }

  async getSLAsByClient(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slas = await this.slaService.findByClient(req.params.clientId);
      res.json(slas);
    } catch (error) {
      next(error);
    }
  }

  async getActiveSLAs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slas = await this.slaService.getActiveSLAs();
      res.json(slas);
    } catch (error) {
      next(error);
    }
  }

  async calculateCompliance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const complianceQuery = plainToClass(ComplianceQueryDto, req.body);
      await this.validateDto(complianceQuery);

      const compliance = await this.slaService.calculateCompliance(
        complianceQuery.slaId,
        complianceQuery.startDate,
        complianceQuery.endDate
      );

      res.json(compliance);
    } catch (error) {
      next(error);
    }
  }

  async validateSLA(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validationRequest = plainToClass(SLAValidationRequestDto, req.body);
      await this.validateDto(validationRequest);

      const validation = await this.slaService.validateSLA(
        validationRequest.slaId,
        validationRequest.ticketId
      );

      res.json(validation);
    } catch (error) {
      next(error);
    }
  }
}
