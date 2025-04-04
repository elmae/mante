import { Repository, DataSource } from "typeorm";
import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";
import { Comment } from "../../../../domain/entities/comment.entity";
import { ITicketRepositoryPort } from "../../ports/output/ticket-repository.port";
import {
  TicketFilters,
  TicketMetrics,
  MetricsFilters,
  SearchResult,
} from "../../ports/input/ticket.port";

export class TicketRepository implements ITicketRepositoryPort {
  private repository: Repository<Ticket>;
  private commentRepository: Repository<Comment>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Ticket);
    this.commentRepository = dataSource.getRepository(Comment);
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
        "comments",
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

  async search(filters: TicketFilters): Promise<SearchResult> {
    return this.list(filters);
  }

  async list(filters: TicketFilters): Promise<SearchResult> {
    const queryBuilder = this.repository
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.atm", "atm")
      .leftJoinAndSelect("ticket.assignedTo", "assignedTo")
      .leftJoinAndSelect("ticket.attachments", "attachments")
      .leftJoinAndSelect("ticket.comments", "comments");

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

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("ticket.created_at", "DESC");

    const [tickets, total] = await queryBuilder.getManyAndCount();

    return { tickets, total };
  }

  async addComment(ticketId: string, commentData: Partial<Comment>): Promise<Comment> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const comment = this.commentRepository.create({
      ...commentData,
      ticket_id: ticketId,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(ticketId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { ticket_id: ticketId },
      relations: ["created_by"],
      order: { created_at: "DESC" },
    });
  }

  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, ticket_id: ticketId },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    await this.commentRepository.remove(comment);
  }

  async findByAtm(atmId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { atm_id: atmId },
      relations: ["assignedTo", "attachments", "comments"],
    });
  }

  async findByTechnician(technicianId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { assigned_to: technicianId },
      relations: ["atm", "attachments", "comments"],
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

  async getMetrics(filters: MetricsFilters): Promise<TicketMetrics> {
    const queryBuilder = this.repository.createQueryBuilder("ticket");

    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere(
        "ticket.created_at BETWEEN :startDate AND :endDate",
        {
          startDate: filters.start_date,
          endDate: filters.end_date,
        }
      );
    }

    if (filters.atm_id) {
      queryBuilder.andWhere("ticket.atm_id = :atmId", {
        atmId: filters.atm_id,
      });
    }

    if (filters.technician_id) {
      queryBuilder.andWhere("ticket.assigned_to = :technicianId", {
        technicianId: filters.technician_id,
      });
    }

    const tickets = await queryBuilder.getMany();
    
    const statusCount: Record<TicketStatus, number> = {} as Record<TicketStatus, number>;
    const priorityCount: Record<TicketPriority, number> = {} as Record<TicketPriority, number>;
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let slaCompliantCount = 0;

    tickets.forEach(ticket => {
      statusCount[ticket.status] = (statusCount[ticket.status] || 0) + 1;
      priorityCount[ticket.priority] = (priorityCount[ticket.priority] || 0) + 1;

      if (ticket.status === TicketStatus.CLOSED && ticket.completion_date) {
        const resolutionTime = ticket.completion_date.getTime() - ticket.created_at.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;

        if (ticket.met_sla) {
          slaCompliantCount++;
        }
      }
    });

    return {
      total: tickets.length,
      by_status: statusCount,
      by_priority: priorityCount,
      average_resolution_time: resolvedCount ? totalResolutionTime / resolvedCount : 0,
      sla_compliance: resolvedCount ? (slaCompliantCount / resolvedCount) * 100 : 0,
    };
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

  async addAttachment(ticketId: string, attachmentData: any): Promise<Ticket> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return this.update(ticketId, {
      attachments: [...(ticket.attachments || []), attachmentData],
    });
  }

  async getAttachments(ticketId: string): Promise<any[]> {
    const ticket = await this.repository.findOne({
      where: { id: ticketId },
      relations: ["attachments"],
    });
    return ticket?.attachments || [];
  }

  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    const ticket = await this.findById(ticketId);
    if (!ticket || !ticket.attachments) {
      throw new Error("Ticket or attachments not found");
    }

    ticket.attachments = ticket.attachments.filter(
      attachment => attachment.id !== attachmentId
    );
    await this.repository.save(ticket);
  }
}
