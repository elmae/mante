import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async list(filters: UserFiltersDto) {
    const { page = 1, limit = 10, role, isActive, search } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .skip(skip)
      .take(limit);

    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.is_active = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.username ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map(user => this.excludePassword(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }
    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {
    const { password, role_id, ...userData } = createUserDto;

    // Verificar si ya existe un usuario con el mismo email o username
    const existingUser = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email OR user.username = :username', {
        email: userData.email,
        username: userData.username
      })
      .getOne();

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email o nombre de usuario');
    }

    const user = this.usersRepository.create({
      ...userData,
      password_hash: await this.hashPassword(password),
      role: { id: role_id } // Asignar el rol usando la relación
    });

    await this.usersRepository.save(user);
    return this.excludePassword(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    const { role_id, ...updateData } = updateUserDto;

    if (updateData.email || updateData.username) {
      const existingUser = await this.usersRepository
        .createQueryBuilder('user')
        .where('(user.email = :email OR user.username = :username) AND user.id != :id', {
          email: updateData.email || user.email,
          username: updateData.username || user.username,
          id
        })
        .getOne();

      if (existingUser) {
        throw new ConflictException('Ya existe un usuario con ese email o nombre de usuario');
      }
    }

    // Actualizar rol si se proporciona
    if (role_id) {
      user.role = { id: role_id } as any;
    }

    Object.assign(user, updateData);
    const savedUser = await this.usersRepository.save(user);
    return this.excludePassword(savedUser);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.delete(id);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  private excludePassword(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
