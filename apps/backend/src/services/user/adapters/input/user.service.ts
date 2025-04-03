import { User } from "../../../../domain/entities/user.entity";
import { IUserRepositoryPort } from "../../ports/output/user-repository.port";
import { IUserInputPort, UserFilters } from "../../ports/input/user.port";
import { CreateUserDto } from "../../dtos/create-user.dto";
import { UpdateUserDto } from "../../dtos/update-user.dto";

export class UserService implements IUserInputPort {
  constructor(private readonly userRepository: IUserRepositoryPort) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async create(userData: CreateUserDto): Promise<User> {
    // Validate if email already exists
    const existingEmail = await this.userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Validate if username already exists
    const existingUsername = await this.userRepository.findByUsername(
      userData.username
    );
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    return this.userRepository.create(userData);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // If updating email, verify it doesn't exist
    if (userData.email && userData.email !== existingUser.email) {
      const existingEmail = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingEmail && existingEmail.id !== id) {
        throw new Error("Email already exists");
      }
    }

    // If updating username, verify it doesn't exist
    if (userData.username && userData.username !== existingUser.username) {
      const existingUsername = await this.userRepository.findByUsername(
        userData.username
      );
      if (existingUsername && existingUsername.id !== id) {
        throw new Error("Username already exists");
      }
    }

    return this.userRepository.update(id, userData);
  }

  async delete(id: string): Promise<void> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }

  async validateCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    return this.userRepository.validateCredentials(username, password);
  }

  async list(filters: UserFilters): Promise<{ users: User[]; total: number }> {
    return this.userRepository.list({
      page: filters.page || 1,
      limit: filters.limit || 10,
      role: filters.role,
      isActive: filters.isActive,
      search: filters.search,
    });
  }
}
