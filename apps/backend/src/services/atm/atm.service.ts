import { ATM } from '../../domain/entities/atm.entity';
import { CreateAtmDto } from '../../domain/dtos/atm/create-atm.dto';
import { UpdateAtmDto } from '../../domain/dtos/atm/update-atm.dto';
import { FilterAtmDto } from '../../domain/dtos/atm/filter-atm.dto';
import { AtmRepository } from './adapters/output/atm.repository';
import { Point } from 'geojson';

export class AtmService {
  constructor(private readonly atmRepository: AtmRepository) {}

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

    return this.atmRepository.create(atmData);
  }

  async findAll(filterDto: FilterAtmDto): Promise<[ATM[], number]> {
    try {
      console.log('Iniciando findAll con filterDto:', JSON.stringify(filterDto));
      const { page = 1, limit = 10 } = filterDto;
      const result = await this.atmRepository.list(page, limit);
      return [result.atms, result.total];
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ATM> {
    const atm = await this.atmRepository.findById(id);
    if (!atm) {
      throw new Error(`ATM con ID ${id} no encontrado`);
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

    return this.atmRepository.update(id, updatedData);
  }

  async remove(id: string): Promise<void> {
    await this.atmRepository.delete(id);
  }

  async findByProximity(latitude: number, longitude: number, radiusInKm: number): Promise<ATM[]> {
    const point: Point = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    return this.atmRepository.findByLocation(point, radiusInKm * 1000);
  }
}
