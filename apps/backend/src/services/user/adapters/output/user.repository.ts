import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../../../../domain/entities/user.entity";
import { IUserRepositoryPort } from "../../ports/output/user-repository.port";
import { CreateUserDto } from "../../dtos/create-user.dto";
import { UpdateUserDto } from "../../dtos/update-user.dto";
import { UserFilters } from "../../ports/input/user.port";

export class UserRepository implements IUserRepositoryPort {
  constructor(private readonly repository: Repository<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["role", "role.permissions"],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: ["role", "role.permissions"],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({
      where: { username },
      relations: ["role", "role.permissions"],
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.repository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.repository.save(user);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    let updateData = { ...userData };

    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }

    await this.repository.update(id, updateData);
    const updatedUser = await this.findById(id);

    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async validateCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    const user = await this.findByUsername(username);
    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.password);
  }

  async list(filters: UserFilters): Promise<{ users: User[]; total: number }> {
    const query = this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("role.permissions", "permissions");

    // Apply filters
    if (filters.role) {
      query.andWhere("role.name = :role", { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      query.andWhere("user.is_active = :isActive", {
        isActive: filters.isActive,
      });
    }

    if (filters.search) {
      query.andWhere(
        "(user.username ILIKE :search OR user.email ILIKE :search OR user.full_name ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Add pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      users,
      total,
    };
  }
}
