import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../../domain/entities/ticket.entity';
import { Comment } from '../../domain/entities/comment.entity';
import { Attachment } from '../../domain/entities/attachment.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketFilterDto } from '../dto/filter-ticket.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      status: TicketStatus.OPEN
    });

    await this.validateTicketData(ticket);
    return await this.ticketRepository.save(ticket);
  }

  async findById(id: string): Promise<Ticket> {
    return await this.ticketRepository.findOneOrFail({
      where: { id },
      relations: ['atm', 'assigned_to', 'comments', 'attachments']
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (updateTicketDto.status && updateTicketDto.status !== ticket.status) {
      await this.validateStatusTransition(ticket, updateTicketDto.status);
    }

    Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findById(id);

    if (ticket.status !== TicketStatus.OPEN) {
      throw new Error('Solo se pueden eliminar tickets en estado OPEN');
    }

    await this.ticketRepository.remove(ticket);
  }

  async list(filters: TicketFilterDto): Promise<{ tickets: Ticket[]; total: number }> {
    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.atm', 'atm')
      .leftJoinAndSelect('ticket.assigned_to', 'assigned_to');

    if (filters.status) {
      queryBuilder.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('ticket.type = :type', { type: filters.type });
    }

    if (filters.priority) {
      queryBuilder.andWhere('ticket.priority = :priority', {
        priority: filters.priority
      });
    }

    if (filters.atm_id) {
      queryBuilder.andWhere('ticket.atm_id = :atmId', { atmId: filters.atm_id });
    }

    if (filters.technician_id) {
      queryBuilder.andWhere('ticket.assigned_to = :technicianId', {
        technicianId: filters.technician_id
      });
    }

    if (filters.search) {
      queryBuilder.andWhere('(ticket.title ILIKE :search OR ticket.description ILIKE :search)', {
        search: `%${filters.search}%`
      });
    }

    if (filters.start_date) {
      queryBuilder.andWhere('ticket.created_at >= :startDate', {
        startDate: filters.start_date
      });
    }

    if (filters.end_date) {
      queryBuilder.andWhere('ticket.created_at <= :endDate', {
        endDate: filters.end_date
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const [tickets, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { tickets, total };
  }

  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (ticket.status !== TicketStatus.OPEN) {
      throw new Error('Solo se pueden asignar tickets en estado OPEN');
    }

    ticket.assigned_to = { id: technicianId } as User;
    ticket.status = TicketStatus.IN_PROGRESS;

    return await this.ticketRepository.save(ticket);
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findById(id);
    await this.validateStatusTransition(ticket, status);

    ticket.status = status;
    if (status === TicketStatus.CLOSED) {
      ticket.completion_date = new Date();
    }

    return await this.ticketRepository.save(ticket);
  }

  async addComment(id: string, content: string): Promise<Comment> {
    const ticket = await this.findById(id);

    const comment = this.commentRepository.create({
      content,
      ticket
    });

    return await this.commentRepository.save(comment);
  }

  async getComments(id: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { ticket: { id } },
      relations: ['created_by'],
      order: { created_at: 'DESC' }
    });
  }

  async addAttachment(id: string, attachmentData: Partial<Attachment>): Promise<Attachment> {
    const ticket = await this.findById(id);

    const attachment = this.attachmentRepository.create({
      ...attachmentData,
      ticket
    });

    return await this.attachmentRepository.save(attachment);
  }

  async getAttachments(id: string): Promise<Attachment[]> {
    return await this.attachmentRepository.find({
      where: { ticket: { id } },
      relations: ['created_by']
    });
  }

  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, ticket: { id: ticketId } }
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    await this.attachmentRepository.remove(attachment);
  }

  private async validateTicketData(ticket: Partial<Ticket>): Promise<void> {
    if (!ticket.atm_id) {
      throw new Error('ATM ID is required');
    }

    if (!ticket.title || !ticket.description) {
      throw new Error('Title and description are required');
    }

    await Promise.resolve(); // Para satisfacer el lint de async/await
  }

  private async validateStatusTransition(ticket: Ticket, newStatus: TicketStatus): Promise<void> {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: []
    };

    if (!validTransitions[ticket.status].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${ticket.status} to ${newStatus}`);
    }

    await Promise.resolve(); // Para satisfacer el lint de async/await
  }
}
