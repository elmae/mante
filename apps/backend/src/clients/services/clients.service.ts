import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../domain/entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { FilterClientDto } from '../dto/filter-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>
  ) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const existingClient = await this.findByEmail(createClientDto.contact_email);
    if (existingClient) {
      throw new BadRequestException('Email already exists');
    }

    const client = this.clientRepository.create({
      ...createClientDto,
      created_by_id: userId,
      updated_by_id: userId
    });

    return this.clientRepository.save(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findById(id);

    if (updateClientDto.contact_email) {
      const existingClient = await this.findByEmail(updateClientDto.contact_email);
      if (existingClient && existingClient.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    Object.assign(client, {
      ...updateClientDto,
      updated_by_id: userId
    });

    return this.clientRepository.save(client);
  }

  async findAll(filterDto?: FilterClientDto): Promise<Client[]> {
    const query = this.clientRepository.createQueryBuilder('client');

    if (filterDto) {
      if (filterDto.name) {
        query.andWhere('client.name ILIKE :name', { name: `%${filterDto.name}%` });
      }
      if (filterDto.contact_email) {
        query.andWhere('client.contact_email ILIKE :email', {
          email: `%${filterDto.contact_email}%`
        });
      }
      if (filterDto.contact_phone) {
        query.andWhere('client.contact_phone ILIKE :phone', {
          phone: `%${filterDto.contact_phone}%`
        });
      }
      if (filterDto.address) {
        query.andWhere('client.address ILIKE :address', { address: `%${filterDto.address}%` });
      }
      if (filterDto.is_active !== undefined) {
        query.andWhere('client.is_active = :isActive', { isActive: filterDto.is_active });
      }
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { contact_email: email } });
  }

  async delete(id: string): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Client not found');
    }
  }

  async activate(id: string, userId: string): Promise<void> {
    const client = await this.findById(id);
    client.is_active = true;
    client.updated_by_id = userId;
    await this.clientRepository.save(client);
  }

  async deactivate(id: string, userId: string): Promise<void> {
    const client = await this.findById(id);
    client.is_active = false;
    client.updated_by_id = userId;
    await this.clientRepository.save(client);
  }
}
