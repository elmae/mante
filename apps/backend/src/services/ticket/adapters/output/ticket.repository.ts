import { Repository, DataSource, Between, In, Like, Not } from "typeorm";
import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";
import { ITicketRepositoryPort } from "../../ports/output/ticket-repository.port";
import { TicketFilters } from "../../ports/input/ticket.port";

export class TicketRepository implements ITicketRepositoryPort {
  private repository: Repository<Ticket>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Ticket);
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        "atm",
        "assignedTo",
        "created_by",
        "updated_by",
        "attachments",
        "maintenanceRecord",
      ],
    });
  }

  async create(ticketData: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.repository.create(ticketData);
    return this.repository.save(ticket);
  }

  async update(id: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    await this.repository.update(id, ticketData);
    const updatedTicket = await this.findById(id);
    if (!updatedTicket) {
      throw new Error("Ticket not found after update");
    }
    return updatedTicket;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(
    filters: TicketFilters
  ): Promise<{ tickets: Ticket[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.atm", "atm")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .leftJoinAndSelect("ticket.attachments", "attachments");

    // Aplicar filtros
    if (filters.status?.length) {
      queryBuilder.andWhere("ticket.status IN (:...status)", {
        status: filters.status,
      });
    }

    if (filters.type?.length) {
      queryBuilder.andWhere("ticket.type IN (:...type)", {
        type: filters.type,
      });
    }

    if (filters.priority?.length) {
      queryBuilder.andWhere("ticket.priority IN (:...priority)", {
        priority: filters.priority,
      });
    }

    if (filters.atmId) {
      queryBuilder.andWhere("ticket.atm_id = :atmId", { atmId: filters.atmId });
    }

    if (filters.technicianId) {
      queryBuilder.andWhere("ticket.assigned_to = :technicianId", {
        technicianId: filters.technicianId,
      });
    }

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere("ticket.created_at BETWEEN :fromDate AND :toDate", {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    }

    if (filters.isOverdue) {
      queryBuilder.andWhere(
        "ticket.due_date < :now AND ticket.status != :closedStatus",
        {
          now: new Date(),
          closedStatus: TicketStatus.CLOSED,
        }
      );
    }

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        "(ticket.title ILIKE :search OR ticket.description ILIKE :search)",
        { search: `%${filters.searchTerm}%` }
      );
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("ticket.created_at", "DESC");

    const [tickets, total] = await queryBuilder.getManyAndCount();

    return { tickets, total };
  }

  async findByAtm(atmId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { atm_id: atmId },
      relations: ["assignedTo", "attachments"],
    });
  }

  async findByTechnician(technicianId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { assigned_to: technicianId },
      relations: ["atm", "attachments"],
    });
  }

  async findByStatus(status: TicketStatus[]): Promise<Ticket[]> {
    return this.repository.find({
      where: { status: In(status) },
      relations: ["atm", "assignedTo"],
    });
  }

  async findByType(type: TicketType[]): Promise<Ticket[]> {
    return this.repository.find({
      where: { type: In(type) },
      relations: ["atm", "assignedTo"],
    });
  }

  async findByPriority(priority: TicketPriority[]): Promise<Ticket[]> {
    return this.repository.find({
      where: { priority: In(priority) },
      relations: ["atm", "assignedTo"],
    });
  }

  async findOverdue(): Promise<Ticket[]> {
    const queryBuilder = this.repository.createQueryBuilder("ticket");
    return queryBuilder
      .where("ticket.due_date < :now", { now: new Date() })
      .andWhere("ticket.status != :closedStatus", {
        closedStatus: TicketStatus.CLOSED,
      })
      .leftJoinAndSelect("ticket.atm", "atm")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .getMany();
  }

  async findRequiringAttention(): Promise<Ticket[]> {
    const queryBuilder = this.repository.createQueryBuilder("ticket");
    return queryBuilder
      .where("ticket.status = :openStatus", { openStatus: TicketStatus.OPEN })
      .orWhere("ticket.priority = :criticalPriority", {
        criticalPriority: TicketPriority.CRITICAL,
      })
      .orWhere("(ticket.due_date < :now AND ticket.status != :closedStatus)", {
        now: new Date(),
        closedStatus: TicketStatus.CLOSED,
      })
      .leftJoinAndSelect("ticket.atm", "atm")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .getMany();
  }

  async getTicketStats(filters: TicketFilters): Promise<any> {
    // Implementar estadísticas usando agregaciones SQL
    const stats = await this.repository
      .createQueryBuilder("ticket")
      .select([
        "COUNT(*) as total",
        "ticket.status",
        "ticket.type",
        "ticket.priority",
        "AVG(EXTRACT(EPOCH FROM (completion_date - created_at))) as avg_resolution_time",
      ])
      .where(filters)
      .groupBy("ticket.status, ticket.type, ticket.priority")
      .getRawMany();

    return this.processTicketStats(stats);
  }

  async addAttachment(ticketId: string, attachmentData: any): Promise<Ticket> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // La lógica específica de attachments se implementará cuando tengamos el servicio de archivos
    return ticket;
  }

  async getAttachments(ticketId: string): Promise<any[]> {
    const ticket = await this.repository.findOne({
      where: { id: ticketId },
      relations: ["attachments"],
    });

    return ticket?.attachments || [];
  }

  async getMaintenanceRecord(ticketId: string): Promise<any | null> {
    const ticket = await this.repository.findOne({
      where: { id: ticketId },
      relations: ["maintenanceRecord"],
    });

    return ticket?.maintenanceRecord || null;
  }

  async search(query: string): Promise<Ticket[]> {
    return this.repository.find({
      where: [
        { title: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      relations: ["atm", "assignedTo"],
    });
  }

  async findByDateRange(fromDate: Date, toDate: Date): Promise<Ticket[]> {
    return this.repository.find({
      where: {
        created_at: Between(fromDate, toDate),
      },
      relations: ["atm", "assignedTo"],
    });
  }

  async findByMultipleStatuses(statuses: TicketStatus[]): Promise<Ticket[]> {
    return this.repository.find({
      where: { status: In(statuses) },
      relations: ["atm", "assignedTo"],
    });
  }

  async validateStatusTransition(
    ticketId: string,
    newStatus: TicketStatus
  ): Promise<boolean> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      return false;
    }
    return ticket.updateStatus(newStatus);
  }

  async checkAssignmentEligibility(ticketId: string): Promise<boolean> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      return false;
    }
    return ticket.canBeAssigned();
  }

  private processTicketStats(rawStats: any[]): any {
    // Procesar los datos crudos de las estadísticas y formatearlos según necesitemos
    // Esta implementación dependerá de cómo queramos presentar los datos
    return rawStats;
  }
}
