import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ATM } from '../../domain/entities';
import { CreateAtmDto } from '../dto/create-atm.dto';
import { UpdateAtmDto } from '../dto/update-atm.dto';
import { FilterAtmDto, AtmSortField } from '../dto/filter-atm.dto';

@Injectable()
export class AtmsService {
  constructor(
    @InjectRepository(ATM)
    private readonly atmRepository: Repository<ATM>
  ) {}

  async create(createAtmDto: CreateAtmDto): Promise<ATM> {
    const atm = this.atmRepository.create(createAtmDto);
    return this.atmRepository.save(atm);
  }

  async findAll(filterDto: FilterAtmDto) {
    const query = this.atmRepository
      .createQueryBuilder('atm')
      .leftJoinAndSelect('atm.branch', 'branch');

    // Búsqueda general
    if (filterDto.search) {
      query.andWhere(
        '(atm.serialNumber ILIKE :search OR atm.model ILIKE :search OR atm.manufacturer ILIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    // Filtros específicos
    if (filterDto.serialNumber) {
      query.andWhere('atm.serialNumber = :serialNumber', {
        serialNumber: filterDto.serialNumber
      });
    }

    if (filterDto.model) {
      query.andWhere('atm.model = :model', { model: filterDto.model });
    }

    if (filterDto.manufacturer) {
      query.andWhere('atm.manufacturer = :manufacturer', {
        manufacturer: filterDto.manufacturer
      });
    }

    if (filterDto.city) {
      query.andWhere('atm.city = :city', { city: filterDto.city });
    }

    if (filterDto.state) {
      query.andWhere('atm.state = :state', { state: filterDto.state });
    }

    if (filterDto.branchId) {
      query.andWhere('atm.branchId = :branchId', {
        branchId: filterDto.branchId
      });
    }

    if (filterDto.isOperational !== undefined) {
      query.andWhere('atm.isOperational = :isOperational', {
        isOperational: filterDto.isOperational
      });
    }

    // Filtros de fecha de mantenimiento
    if (filterDto.maintenanceFrom) {
      query.andWhere('atm.lastMaintenanceDate >= :maintenanceFrom', {
        maintenanceFrom: filterDto.maintenanceFrom
      });
    }

    if (filterDto.maintenanceTo) {
      query.andWhere('atm.lastMaintenanceDate <= :maintenanceTo', {
        maintenanceTo: filterDto.maintenanceTo
      });
    }

    // Filtros de ubicación
    if (filterDto.latitude && filterDto.longitude && filterDto.radius) {
      query.andWhere(
        'ST_DWithin(ST_MakePoint(atm.location.coordinates.longitude, atm.location.coordinates.latitude)::geography, ST_MakePoint(:longitude, :latitude)::geography, :radius)',
        {
          latitude: filterDto.latitude,
          longitude: filterDto.longitude,
          radius: filterDto.radius * 1000 // Convertir km a metros
        }
      );
    }

    // Ordenamiento
    if (filterDto.sortBy) {
      const sortField = this.getSortField(filterDto.sortBy);
      query.orderBy(`atm.${sortField}`, filterDto.sortOrder);
    } else {
      query.orderBy('atm.createdAt', 'DESC');
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

  async findOne(id: string): Promise<ATM> {
    const atm = await this.atmRepository.findOne({
      where: { id },
      relations: ['branch']
    });

    if (!atm) {
      throw new NotFoundException(`ATM #${id} not found`);
    }

    return atm;
  }

  async update(id: string, updateAtmDto: UpdateAtmDto): Promise<ATM> {
    const atm = await this.findOne(id);
    Object.assign(atm, updateAtmDto);
    return this.atmRepository.save(atm);
  }

  async remove(id: string): Promise<void> {
    const result = await this.atmRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ATM #${id} not found`);
    }
  }

  private getSortField(sortBy: AtmSortField): string {
    const sortFieldMap: Record<AtmSortField, string> = {
      [AtmSortField.SERIAL_NUMBER]: 'serialNumber',
      [AtmSortField.MODEL]: 'model',
      [AtmSortField.MANUFACTURER]: 'manufacturer',
      [AtmSortField.CREATED_AT]: 'createdAt',
      [AtmSortField.LAST_MAINTENANCE]: 'lastMaintenanceDate',
      [AtmSortField.STATUS]: 'isOperational'
    };

    return sortFieldMap[sortBy] || 'createdAt';
  }
}
