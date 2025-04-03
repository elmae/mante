import { User } from "../../../../domain/entities/user.entity";
import { CreateUserDto } from "../../dtos/create-user.dto";
import { UpdateUserDto } from "../../dtos/update-user.dto";

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface IUserInputPort {
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
  validateCredentials(username: string, password: string): Promise<boolean>;
  list(filters: UserFilters): Promise<{ users: User[]; total: number }>;
}
