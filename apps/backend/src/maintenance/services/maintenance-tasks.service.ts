import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTask, TaskStatus, User } from '../../domain/entities';
import { CreateMaintenanceTaskDto, UpdateMaintenanceTaskDto } from '../dto';

@Injectable()
export class MaintenanceTasksService {
  constructor(
    @InjectRepository(MaintenanceTask)
    private readonly taskRepository: Repository<MaintenanceTask>
  ) {}

  async create(
    maintenanceId: string,
    createTaskDto: CreateMaintenanceTaskDto
  ): Promise<MaintenanceTask> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      maintenance: { id: maintenanceId },
      status: TaskStatus.PENDING
    });

    return this.taskRepository.save(task);
  }

  async findAll(maintenanceId: string): Promise<MaintenanceTask[]> {
    return this.taskRepository.find({
      where: { maintenance: { id: maintenanceId } },
      relations: ['assignedTo'],
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string): Promise<MaintenanceTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['maintenance', 'assignedTo']
    });

    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateMaintenanceTaskDto): Promise<MaintenanceTask> {
    const task = await this.findOne(id);

    // Si se está completando la tarea
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updateTaskDto.completedAt = new Date();
    }

    // Si se está iniciando la tarea
    if (updateTaskDto.status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      updateTaskDto.startedAt = new Date();
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async delete(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task #${id} not found`);
    }
  }

  async assign(id: string, technicianId: string): Promise<MaintenanceTask> {
    const task = await this.findOne(id);

    task.assignedTo = { id: technicianId } as User;
    task.assignedToId = technicianId;

    return this.taskRepository.save(task);
  }

  async updateOrder(
    maintenanceId: string,
    taskOrders: { id: string; order: number }[]
  ): Promise<void> {
    const tasks = await this.findAll(maintenanceId);

    // Validar que todas las tareas pertenezcan al mantenimiento
    const taskIds = new Set(tasks.map(t => t.id));
    if (!taskOrders.every(t => taskIds.has(t.id))) {
      throw new NotFoundException('Some tasks do not belong to this maintenance record');
    }

    // Actualizar el orden de las tareas
    await Promise.all(taskOrders.map(({ id, order }) => this.taskRepository.update(id, { order })));
  }
}
