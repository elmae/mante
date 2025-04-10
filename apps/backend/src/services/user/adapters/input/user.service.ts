import { User } from '../../../../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '../../../../common/exceptions/unauthorized.exception';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions']
    });
  }

  async validateCredentials(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'password_hash', 'is_active']
    });

    if (!user) {
      return false;
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (isValid) {
      await this.updateLastLogin(user.id);
    }

    return isValid;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      updated_at: new Date()
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.findByEmail(dto.email);
    if (exists) {
      throw new UnauthorizedException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password_hash: passwordHash,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
      role: { id: dto.role_id },
      is_active: dto.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date()
    });

    return await this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User> {
    const user = await this.findById(id);

    const updatedUser = {
      ...user,
      ...updateData,
      updated_at: new Date()
    };

    if (updateData.password_hash) {
      updatedUser.password_hash = await bcrypt.hash(updateData.password_hash, 10);
    }

    await this.userRepository.save(updatedUser);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: ids.map(id => ({ id })),
      relations: ['role', 'role.permissions']
    });
  }
}
