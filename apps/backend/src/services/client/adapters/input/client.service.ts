import { Client } from '../../../../domain/entities/client.entity';
import { CreateClientDto, CreateClientResponseDto } from '../../dtos/create-client.dto';
import { UpdateClientDto, UpdateClientResponseDto } from '../../dtos/update-client.dto';
import { ClientPort } from '../../ports/input/client.port';
import { ClientRepositoryPort } from '../../ports/output/client-repository.port';

export class ClientService implements ClientPort {
  constructor(private readonly clientRepository: ClientRepositoryPort) {}

  async create(createClientDto: CreateClientDto, userId: string): Promise<CreateClientResponseDto> {
    const emailExists = await this.clientRepository.existsByEmail(createClientDto.contact_email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    const client = await this.clientRepository.create(createClientDto, userId);
    return this.mapToCreateResponse(client);
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    userId: string
  ): Promise<UpdateClientResponseDto> {
    const exists = await this.clientRepository.exists(id);
    if (!exists) {
      throw new Error('Client not found');
    }

    if (updateClientDto.contact_email) {
      const emailExists = await this.clientRepository.existsByEmail(updateClientDto.contact_email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    const client = await this.clientRepository.update(id, updateClientDto, userId);
    return this.mapToUpdateResponse(client);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error('Client not found');
    }
    return client;
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientRepository.findByEmail(email);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.clientRepository.exists(id);
    if (!exists) {
      throw new Error('Client not found');
    }
    await this.clientRepository.delete(id);
  }

  async activate(id: string, userId: string): Promise<void> {
    const exists = await this.clientRepository.exists(id);
    if (!exists) {
      throw new Error('Client not found');
    }
    await this.clientRepository.activate(id, userId);
  }

  async deactivate(id: string, userId: string): Promise<void> {
    const exists = await this.clientRepository.exists(id);
    if (!exists) {
      throw new Error('Client not found');
    }
    await this.clientRepository.deactivate(id, userId);
  }

  private mapToCreateResponse(client: Client): CreateClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone,
      address: client.address,
      is_active: client.is_active,
      created_at: client.created_at,
      updated_at: client.updated_at,
      created_by_id: client.created_by_id,
      updated_by_id: client.updated_by_id
    };
  }

  private mapToUpdateResponse(client: Client): UpdateClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone,
      address: client.address,
      is_active: client.is_active,
      updated_at: client.updated_at,
      updated_by_id: client.updated_by_id
    };
  }
}
