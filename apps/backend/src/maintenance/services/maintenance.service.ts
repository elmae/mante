import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Maintenance,
  MaintenancePart,
  MaintenanceTask,
  MaintenanceComment,
  MaintenanceAttachment,
  User
} from '../../domain/entities';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { FilterMaintenanceDto } from '../dto/filter-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(MaintenancePart)
    private readonly maintenancePartRepository: Repository<MaintenancePart>,
    @InjectRepository(MaintenanceTask)
    private readonly maintenanceTaskRepository: Repository<MaintenanceTask>,
    @InjectRepository(MaintenanceComment)
    private readonly maintenanceCommentRepository: Repository<MaintenanceComment>,
    @InjectRepository(MaintenanceAttachment)
    private readonly maintenanceAttachmentRepository: Repository<MaintenanceAttachment>
  ) {}

  async create(
    createMaintenanceDto: CreateMaintenanceDto & { createdBy: User }
  ): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      createdBy: createMaintenanceDto.createdBy,
      createdById: createMaintenanceDto.createdBy.id
    });

    return this.maintenanceRepository.save(maintenance);
  }

  async findAll(filterDto: FilterMaintenanceDto) {
    const query = this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.createdBy', 'createdBy')
      .leftJoinAndSelect('maintenance.assignedTo', 'assignedTo')
      .leftJoinAndSelect('maintenance.parts', 'parts')
      .leftJoinAndSelect('maintenance.tasks', 'tasks')
      .leftJoinAndSelect('maintenance.comments', 'comments');

    if (filterDto.status) {
      query.andWhere('maintenance.status = :status', { status: filterDto.status });
    }

    if (filterDto.type) {
      query.andWhere('maintenance.type = :type', { type: filterDto.type });
    }

    if (filterDto.assignedToId) {
      query.andWhere('maintenance.assignedToId = :assignedToId', {
        assignedToId: filterDto.assignedToId
      });
    }

    if (filterDto.atmId) {
      query.andWhere('maintenance.atmId = :atmId', { atmId: filterDto.atmId });
    }

    if (filterDto.requiresFollowUp !== undefined) {
      query.andWhere('maintenance.requiresFollowUp = :requiresFollowUp', {
        requiresFollowUp: filterDto.requiresFollowUp
      });
    }

    if (filterDto.startDate && filterDto.endDate) {
      query.andWhere('maintenance.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filterDto.startDate,
        endDate: filterDto.endDate
      });
    }

    // Ordenamiento
    if (filterDto.sortBy) {
      query.orderBy(`maintenance.${filterDto.sortBy}`, filterDto.sortOrder);
    } else {
      query.orderBy('maintenance.createdAt', 'DESC');
    }

    // Paginación
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    query.skip((page - 1) * limit).take(limit);

    const [records, total] = await query.getManyAndCount();
    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'parts', 'tasks', 'comments']
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance record #${id} not found`);
    }

    return maintenance;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.findOne(id);
    Object.assign(maintenance, updateMaintenanceDto);
    return this.maintenanceRepository.save(maintenance);
  }

  async delete(id: string): Promise<void> {
    const result = await this.maintenanceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Maintenance record #${id} not found`);
    }
  }

  async findParts(maintenanceId: string): Promise<MaintenancePart[]> {
    const maintenance = await this.findOne(maintenanceId);
    return this.maintenancePartRepository.find({
      where: { maintenance: { id: maintenanceId } },
      relations: ['addedBy']
    });
  }

  async addParts(maintenanceId: string, parts: MaintenancePart[]): Promise<Maintenance> {
    const maintenance = await this.findOne(maintenanceId);

    const newParts = parts.map(part =>
      this.maintenancePartRepository.create({
        ...part,
        maintenance
      })
    );

    await this.maintenancePartRepository.save(newParts);
    return this.findOne(maintenanceId);
  }

  async findComments(maintenanceId: string): Promise<MaintenanceComment[]> {
    return this.maintenanceCommentRepository.find({
      where: { maintenance: { id: maintenanceId } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async addComment(
    maintenanceId: string,
    commentData: { content: string; created_by: User }
  ): Promise<MaintenanceComment> {
    const maintenance = await this.findOne(maintenanceId);

    const comment = this.maintenanceCommentRepository.create({
      content: commentData.content,
      maintenance,
      createdBy: commentData.created_by,
      createdById: commentData.created_by.id
    });

    return this.maintenanceCommentRepository.save(comment);
  }

  async assignTechnician(maintenanceId: string, technicianId: string): Promise<Maintenance> {
    const maintenance = await this.findOne(maintenanceId);

    maintenance.assignedToId = technicianId;
    maintenance.assignedTo = { id: technicianId } as User;

    return this.maintenanceRepository.save(maintenance);
  }
}
