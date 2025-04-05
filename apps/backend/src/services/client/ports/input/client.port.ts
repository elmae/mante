import { Client } from '../../../../domain/entities/client.entity';
import { CreateClientDto, CreateClientResponseDto } from '../../dtos/create-client.dto';
import { UpdateClientDto, UpdateClientResponseDto } from '../../dtos/update-client.dto';

export interface ClientPort {
  create(createClientDto: CreateClientDto, userId: string): Promise<CreateClientResponseDto>;
  update(
    id: string,
    updateClientDto: UpdateClientDto,
    userId: string
  ): Promise<UpdateClientResponseDto>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client>;
  findByEmail(email: string): Promise<Client | null>;
  delete(id: string): Promise<void>;
  activate(id: string, userId: string): Promise<void>;
  deactivate(id: string, userId: string): Promise<void>;
}
