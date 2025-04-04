import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { TicketService } from "../services/ticket/adapters/input/ticket.service";
import { CreateTicketDto } from "../services/ticket/dtos/create-ticket.dto";
import {
  UpdateTicketDto,
  AssignTicketDto,
  UpdateTicketStatusDto,
  TicketFilterDto,
} from "../services/ticket/dtos/update-ticket.dto";
import { Ticket } from "../domain/entities/ticket.entity";
import { Attachment } from "../domain/entities/attachment.entity";
import { User } from "../domain/entities/user.entity";
import multer from "multer";

interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // Métodos para comentarios
  async addComment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comment = await this.ticketService.addComment(req.params.id, {
        content: req.body.content,
        created_by: { id: req.user?.id } as User,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async listComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const comments = await this.ticketService.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.ticketService.deleteComment(req.params.id, req.params.commentId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Métodos para adjuntos
  async listAttachments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const attachments = await this.ticketService.getAttachments(req.params.id);
      res.json(attachments);
    } catch (error) {
      next(error);
    }
  }

  async deleteAttachment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.ticketService.deleteAttachment(req.params.id, req.params.attachmentId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Métricas y estadísticas
  async getTicketMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const metrics = await this.ticketService.getMetrics({
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        atm_id: req.query.atm_id as string,
        technician_id: req.query.technician_id as string,
      });
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  // Búsqueda avanzada
  async searchTickets(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { tickets, total } = await this.ticketService.search({
        ...req.query,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });

      res.json({
        data: tickets,
        meta: {
          total,
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
          pages: Math.ceil(total / (Number(req.query.limit) || 10)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private async validateDto(dto: any): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new Error(
        errors.map((error) => Object.values(error.constraints || {})).join(", ")
      );
    }
  }

  async createTicket(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const createTicketDto = plainToClass(CreateTicketDto, req.body);
      await this.validateDto(createTicketDto);

      const { attachments, ...ticketData } = createTicketDto;
      const ticket = await this.ticketService.create({
        ...ticketData,
        created_by: { id: req.user?.id } as User,
      });

      // Si hay archivos adjuntos, los procesamos después de crear el ticket
      if (attachments?.length) {
        for (const attachment of attachments) {
          await this.ticketService.addAttachment(ticket.id, {
            ...attachment,
            created_by_id: req.user?.id,
          });
        }
      }

      const fullTicket = await this.ticketService.findById(ticket.id);
      res.status(201).json(fullTicket);
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updateTicketDto = plainToClass(UpdateTicketDto, req.body);
      await this.validateDto(updateTicketDto);

      const { attachments, ...ticketData } = updateTicketDto;
      const ticket = await this.ticketService.update(req.params.id, {
        ...ticketData,
        updated_by: { id: req.user?.id } as User,
      });

      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assignTicketDto = plainToClass(AssignTicketDto, req.body);
      await this.validateDto(assignTicketDto);

      const ticket = await this.ticketService.assignTechnician(
        req.params.id,
        assignTicketDto.technician_id
      );

      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusDto = plainToClass(UpdateTicketStatusDto, req.body);
      await this.validateDto(statusDto);

      const ticket = await this.ticketService.updateStatus(
        req.params.id,
        statusDto.status
      );

      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async listTickets(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDto = plainToClass(TicketFilterDto, req.query);
      await this.validateDto(filterDto);

      const { tickets, total } = await this.ticketService.list(filterDto);

      res.json({
        data: tickets,
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

  async getTicketById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const ticket = await this.ticketService.findById(req.params.id);
      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.ticketService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getTicketsByAtm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tickets = await this.ticketService.findByAtm(req.params.atmId);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  async getTicketsByTechnician(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tickets = await this.ticketService.findByTechnician(
        req.params.technicianId
      );
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  async getOverdueTickets(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tickets = await this.ticketService.getOverdueTickets();
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  async getTicketsRequiringAttention(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tickets = await this.ticketService.getTicketsRequiringAttention();
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  }

  async addAttachment(
    req: RequestWithUser & { file?: Express.Multer.File },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const attachmentData: Partial<Attachment> = {
        ticket_id: req.params.id,
        file_name: req.file.originalname,
        file_path: req.file.path,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        created_by_id: req.user?.id,
      };

      const ticket = await this.ticketService.addAttachment(
        req.params.id,
        attachmentData
      );
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }
}
