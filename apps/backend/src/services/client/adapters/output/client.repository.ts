import { Repository } from 'typeorm';
import { Client } from '../../../../domain/entities/client.entity';
import { CreateClientDto } from '../../dtos/create-client.dto';
import { UpdateClientDto } from '../../dtos/update-client.dto';
import { ClientRepositoryPort } from '../../ports/output/client-repository.port';

export class ClientRepository implements ClientRepositoryPort {
  constructor(private readonly repository: Repository<Client>) {}

  async save(client: Client): Promise<Client> {
    return this.repository.save(client);
  }

  async create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.repository.create({
      ...createClientDto,
      created_by_id: userId,
      updated_by_id: userId
    });
    return this.repository.save(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    await this.repository.update(id, {
      ...updateClientDto,
      updated_by_id: userId
    });
    return this.findById(id) as Promise<Client>;
  }

  async findAll(): Promise<Client[]> {
    return this.repository.find({
      relations: ['created_by', 'updated_by', 'atms']
    });
  }

  async findById(id: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['created_by', 'updated_by', 'atms']
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { contact_email: email },
      relations: ['created_by', 'updated_by', 'atms']
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { contact_email: email }
    });
    return count > 0;
  }

  async activate(id: string, userId: string): Promise<void> {
    await this.repository.update(id, {
      is_active: true,
      updated_by_id: userId
    });
  }

  async deactivate(id: string, userId: string): Promise<void> {
    await this.repository.update(id, {
      is_active: false,
      updated_by_id: userId
    });
  }
}
