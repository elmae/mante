import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Maintenance } from '../../domain/entities/maintenance.entity';
import { MaintenancePart } from '../../domain/entities/maintenance-part.entity';
import { MaintenanceTask } from '../../domain/entities/maintenance-task.entity';
import { MaintenanceComment } from '../../domain/entities/maintenance-comment.entity';
import { MaintenanceAttachment } from '../../domain/entities/maintenance-attachment.entity';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { FilterMaintenanceDto, MaintenanceStatus } from '../dto/filter-maintenance.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(MaintenancePart)
    private maintenancePartRepository: Repository<MaintenancePart>,
    @InjectRepository(MaintenanceTask)
    private maintenanceTaskRepository: Repository<MaintenanceTask>,
    @InjectRepository(MaintenanceComment)
    private maintenanceCommentRepository: Repository<MaintenanceComment>,
    @InjectRepository(MaintenanceAttachment)
    private maintenanceAttachmentRepository: Repository<MaintenanceAttachment>,
    private configService: ConfigService
  ) {}

  async create(
    createMaintenanceDto: CreateMaintenanceDto & { created_by: User }
  ): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      status: MaintenanceStatus.PENDING
    });

    return this.maintenanceRepository.save(maintenance);
  }

  async findAll(filterDto: FilterMaintenanceDto) {
    const query = this.maintenanceRepository
      .createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.technician', 'technician')
      .leftJoinAndSelect('maintenance.atm', 'atm')
      .leftJoinAndSelect('maintenance.parts', 'parts')
      .leftJoinAndSelect('maintenance.measurements', 'measurements');

    if (filterDto.atm_id) {
      query.andWhere('maintenance.atm_id = :atm_id', { atm_id: filterDto.atm_id });
    }

    if (filterDto.technician_id) {
      query.andWhere('maintenance.technician_id = :technician_id', {
        technician_id: filterDto.technician_id
      });
    }

    if (filterDto.status) {
      query.andWhere('maintenance.status = :status', { status: filterDto.status });
    }

    if (filterDto.requires_follow_up !== undefined) {
      query.andWhere('maintenance.requires_follow_up = :requires_follow_up', {
        requires_follow_up: filterDto.requires_follow_up
      });
    }

    if (filterDto.date_from && filterDto.date_to) {
      query.andWhere('maintenance.created_at BETWEEN :start AND :end', {
        start: filterDto.date_from,
        end: filterDto.date_to
      });
    }

    const total = await query.getCount();
    const records = await query
      .skip((filterDto.page - 1) * filterDto.limit)
      .take(filterDto.limit)
      .getMany();

    return { records, total };
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['technician', 'atm', 'parts', 'measurements', 'comments']
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance #${id} not found`);
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
      throw new NotFoundException(`Maintenance #${id} not found`);
    }
  }

  async addParts(maintenanceId: string, parts: any[]): Promise<Maintenance> {
    const maintenance = await this.findOne(maintenanceId);

    const newParts = this.maintenancePartRepository.create(
      parts.map(part => ({ ...part, maintenance }))
    );

    await this.maintenancePartRepository.save(newParts);
    return this.findOne(maintenanceId);
  }

  async addComment(maintenanceId: string, commentData: any): Promise<MaintenanceComment> {
    const maintenance = await this.findOne(maintenanceId);

    const comment = this.maintenanceCommentRepository.create({
      ...commentData,
      maintenance
    });

    return this.maintenanceCommentRepository.save(comment);
  }

  async addAttachment(maintenanceId: string, attachmentData: any): Promise<MaintenanceAttachment> {
    const maintenance = await this.findOne(maintenanceId);

    const attachment = this.maintenanceAttachmentRepository.create({
      ...attachmentData,
      maintenance
    });

    return this.maintenanceAttachmentRepository.save(attachment);
  }

  async findInProgress(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { status: MaintenanceStatus.IN_PROGRESS },
      relations: ['technician', 'atm']
    });
  }

  async findRequiringFollowUp(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { requires_follow_up: true },
      relations: ['technician', 'atm']
    });
  }

  async findByATM(atmId: string): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { atm: { id: atmId } },
      relations: ['technician'],
      order: { created_at: 'DESC' }
    });
  }

  async findByTechnician(technicianId: string): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { technician: { id: technicianId } },
      relations: ['atm'],
      order: { created_at: 'DESC' }
    });
  }
}
