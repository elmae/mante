import { Client } from '../../../../domain/entities/client.entity';
import { CreateClientDto } from '../../dtos/create-client.dto';
import { UpdateClientDto } from '../../dtos/update-client.dto';

export interface ClientRepositoryPort {
  save(client: Client): Promise<Client>;
  create(createClientDto: CreateClientDto, userId: string): Promise<Client>;
  update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  activate(id: string, userId: string): Promise<void>;
  deactivate(id: string, userId: string): Promise<void>;
}
