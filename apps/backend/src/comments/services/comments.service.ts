import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/entities/comment.entity';
import { MaintenanceComment } from '../../domain/entities/maintenance-comment.entity';
import { CreateTicketCommentDto, CreateMaintenanceCommentDto } from '../dto/create-comment.dto';
import { UpdateTicketCommentDto, UpdateMaintenanceCommentDto } from '../dto/update-comment.dto';
import { TicketsService } from '../../tickets/services/tickets.service';
import { MaintenanceService } from '../../maintenance/services/maintenance.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly ticketCommentsRepository: Repository<Comment>,
    @InjectRepository(MaintenanceComment)
    private readonly maintenanceCommentsRepository: Repository<MaintenanceComment>,
    private readonly ticketsService: TicketsService,
    private readonly maintenanceService: MaintenanceService
  ) {}

  // Métodos para comentarios de tickets
  async createTicketComment(dto: CreateTicketCommentDto, userId: string) {
    const ticket = await this.ticketsService.findById(dto.ticket_id);
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    const comment = this.ticketCommentsRepository.create({
      ...dto,
      createdBy: { id: userId }
    });

    return this.ticketCommentsRepository.save(comment);
  }

  async getTicketComments(ticketId: string) {
    return this.ticketCommentsRepository.find({
      where: { ticketId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getTicketCommentById(id: string) {
    const comment = await this.ticketCommentsRepository.findOne({
      where: { id },
      relations: ['createdBy']
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  async updateTicketComment(id: string, dto: UpdateTicketCommentDto, userId: string) {
    const comment = await this.getTicketCommentById(id);

    if (comment.createdBy.id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este comentario');
    }

    return this.ticketCommentsRepository.save({
      ...comment,
      ...dto
    });
  }

  async deleteTicketComment(id: string, userId: string) {
    const comment = await this.getTicketCommentById(id);

    if (comment.createdBy.id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este comentario');
    }

    await this.ticketCommentsRepository.remove(comment);
  }

  // Métodos para comentarios de mantenimiento
  async createMaintenanceComment(dto: CreateMaintenanceCommentDto, userId: string) {
    const maintenance = await this.maintenanceService.findOne(dto.maintenance_record_id);
    if (!maintenance) {
      throw new NotFoundException('Registro de mantenimiento no encontrado');
    }

    const comment = this.maintenanceCommentsRepository.create({
      ...dto,
      createdById: userId,
      maintenanceId: maintenance.id,
      maintenance
    });

    return this.maintenanceCommentsRepository.save(comment);
  }

  async getMaintenanceComments(maintenanceId: string) {
    return this.maintenanceCommentsRepository.find({
      where: { maintenanceId },
      relations: ['createdBy', 'editedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getMaintenanceCommentById(id: string) {
    const comment = await this.maintenanceCommentsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'editedBy']
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }

  async updateMaintenanceComment(id: string, dto: UpdateMaintenanceCommentDto, userId: string) {
    const comment = await this.getMaintenanceCommentById(id);

    if (!comment.canEdit(userId)) {
      throw new ForbiddenException('No tienes permiso para editar este comentario');
    }

    return this.maintenanceCommentsRepository.save({
      ...comment,
      ...dto,
      editedById: userId,
      editedAt: new Date()
    });
  }

  async deleteMaintenanceComment(id: string, userId: string) {
    const comment = await this.getMaintenanceCommentById(id);

    if (!comment.canEdit(userId)) {
      throw new ForbiddenException('No tienes permiso para eliminar este comentario');
    }

    await this.maintenanceCommentsRepository.remove(comment);
  }
}
