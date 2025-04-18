import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ATM } from '../../domain/entities/atm.entity';
import { CreateAtmDto } from '../dto/create-atm.dto';
import { UpdateAtmDto } from '../dto/update-atm.dto';
import { FilterAtmDto } from '../dto/filter-atm.dto';
import { Point } from 'geojson';

@Injectable()
export class AtmsService {
  constructor(
    @InjectRepository(ATM)
    private readonly atmRepository: Repository<ATM>
  ) {}

  async create(createAtmDto: CreateAtmDto, userId: string): Promise<ATM> {
    const atmData = {
      ...createAtmDto,
      created_by_id: userId,
      updated_by_id: userId,
      location:
        createAtmDto.location &&
        ({
          type: 'Point' as const,
          coordinates: createAtmDto.location.coordinates
        } as Point),
      technical_details: createAtmDto.technical_details && {
        manufacturer: createAtmDto.technical_details.manufacturer || 'Unknown',
        installation_date: new Date(createAtmDto.technical_details.installation_date || new Date()),
        last_maintenance_date: createAtmDto.technical_details.last_maintenance_date
          ? new Date(createAtmDto.technical_details.last_maintenance_date)
          : new Date(),
        software_version: createAtmDto.technical_details.software_version || '1.0.0',
        hardware_version: createAtmDto.technical_details.hardware_version || '1.0.0',
        network_config: {
          ip_address: createAtmDto.technical_details.network_config?.ip_address || '0.0.0.0',
          subnet_mask:
            createAtmDto.technical_details.network_config?.subnet_mask || '255.255.255.0',
          gateway: createAtmDto.technical_details.network_config?.gateway || '0.0.0.0'
        },
        capabilities: createAtmDto.technical_details.capabilities || []
      }
    };

    const atm = this.atmRepository.create(atmData);
    return await this.atmRepository.save(atm);
  }

  async findAll(filterDto: FilterAtmDto): Promise<[ATM[], number]> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      client_id,
      zone_id,
      sort_by,
      sort_order
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.atmRepository.createQueryBuilder('atm');

    if (search) {
      queryBuilder.where(
        '(atm.serial_number ILIKE :search OR atm.model ILIKE :search OR atm.address ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('atm.status = :status', { status });
    }

    if (client_id) {
      queryBuilder.andWhere('atm.client_id = :client_id', { client_id });
    }

    if (zone_id) {
      queryBuilder.andWhere('atm.zone_id = :zone_id', { zone_id });
    }

    if (sort_by) {
      queryBuilder.orderBy(`atm.${sort_by}`, sort_order || 'ASC');
    }

    queryBuilder.skip(skip).take(limit);

    const [atms, total] = await queryBuilder.getManyAndCount();
    return [atms, total];
  }

  async findOne(id: string): Promise<ATM> {
    const atm = await this.atmRepository.findOne({ where: { id } });
    if (!atm) {
      throw new NotFoundException(`ATM con ID ${id} no encontrado`);
    }
    return atm;
  }

  async update(id: string, updateAtmDto: UpdateAtmDto, userId: string): Promise<ATM> {
    const currentAtm = await this.findOne(id);
    const { location, technical_details, ...updateData } = updateAtmDto;

    const updatedData = {
      ...updateData,
      updated_by_id: userId,
      ...(location && {
        location: {
          type: 'Point' as const,
          coordinates: location.coordinates
        } as Point
      }),
      ...(technical_details && {
        technical_details: {
          ...currentAtm.technical_details,
          ...technical_details,
          installation_date: technical_details.installation_date
            ? new Date(technical_details.installation_date)
            : currentAtm.technical_details?.installation_date,
          last_maintenance_date: technical_details.last_maintenance_date
            ? new Date(technical_details.last_maintenance_date)
            : currentAtm.technical_details?.last_maintenance_date,
          network_config: technical_details.network_config
            ? {
                ...currentAtm.technical_details?.network_config,
                ...technical_details.network_config
              }
            : currentAtm.technical_details?.network_config
        }
      })
    };

    await this.atmRepository.update(id, updatedData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.atmRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ATM con ID ${id} no encontrado`);
    }
  }

  async findByProximity(latitude: number, longitude: number, radiusInKm: number): Promise<ATM[]> {
    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    // Convertir radio de km a metros para ST_DWithin
    const radiusInMeters = radiusInKm * 1000;

    const atms = await this.atmRepository
      .createQueryBuilder('atm')
      .where(
        'ST_DWithin(atm.location::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, :radius)',
        {
          latitude,
          longitude,
          radius: radiusInMeters
        }
      )
      .orderBy(
        'ST_Distance(atm.location::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography)',
        'ASC'
      )
      .getMany();

    return atms;
  }
}
