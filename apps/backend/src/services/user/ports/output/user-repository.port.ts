import { User } from "../../../../domain/entities/user.entity";
import { CreateUserDto } from "../../dtos/create-user.dto";
import { UpdateUserDto } from "../../dtos/update-user.dto";
import { UserFilters } from "../input/user.port";

export interface IUserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
  validateCredentials(username: string, password: string): Promise<boolean>;
  list(filters: UserFilters): Promise<{ users: User[]; total: number }>;
}
