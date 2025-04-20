import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, User, Comment } from '../../domain/entities';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { FilterTicketDto } from '../dto/filter-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>
  ) {}

  async create(createTicketDto: CreateTicketDto, user: User): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      createdBy: user,
      createdById: user.id,
      status: TicketStatus.PENDING
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(filterDto: FilterTicketDto) {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.assignedTo', 'assignedTo')
      .leftJoinAndSelect('ticket.comments', 'comments');

    if (filterDto.status) {
      query.andWhere('ticket.status = :status', { status: filterDto.status });
    }

    if (filterDto.priority) {
      query.andWhere('ticket.priority = :priority', { priority: filterDto.priority });
    }

    if (filterDto.type) {
      query.andWhere('ticket.type = :type', { type: filterDto.type });
    }

    if (filterDto.assignedToId) {
      query.andWhere('ticket.assignedToId = :assignedToId', {
        assignedToId: filterDto.assignedToId
      });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'comments']
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);

    // Validar transiciones de estado
    if (
      updateTicketDto.status &&
      !this.isValidStatusTransition(ticket.status, updateTicketDto.status)
    ) {
      throw new BadRequestException(
        `Invalid status transition from ${ticket.status} to ${updateTicketDto.status}`
      );
    }

    Object.assign(ticket, updateTicketDto);

    if (updateTicketDto.status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (updateTicketDto.status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }

    return this.ticketRepository.save(ticket);
  }

  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (!ticket.canAssign()) {
      throw new BadRequestException('Ticket cannot be assigned in its current status');
    }

    ticket.assignedTo = { id: technicianId } as User;
    ticket.assignedToId = technicianId;
    ticket.status = TicketStatus.IN_PROGRESS;

    return this.ticketRepository.save(ticket);
  }

  async delete(id: string): Promise<void> {
    const result = await this.ticketRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }
  }

  async findComments(ticketId: string) {
    return this.commentRepository.find({
      where: { ticketId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  private isValidStatusTransition(fromStatus: TicketStatus, toStatus: TicketStatus): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.PENDING]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.PENDING],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: []
    };

    return validTransitions[fromStatus]?.includes(toStatus) ?? false;
  }
}
