import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { MaintenanceTasksService } from '../services/maintenance-tasks.service';
import { CreateMaintenanceTaskDto, UpdateMaintenanceTaskDto } from '../dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles, TechnicalStaff, ReadOnlyAccess } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.types';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../domain/entities';

@Controller('maintenance/:maintenanceId/tasks')
@UseGuards(AuthGuard)
export class MaintenanceTasksController {
  constructor(private readonly tasksService: MaintenanceTasksService) {}

  @Post()
  @TechnicalStaff()
  create(
    @Param('maintenanceId', ParseUUIDPipe) maintenanceId: string,
    @Body() createTaskDto: CreateMaintenanceTaskDto
  ) {
    return this.tasksService.create(maintenanceId, createTaskDto);
  }

  @Get()
  @ReadOnlyAccess()
  findAll(@Param('maintenanceId', ParseUUIDPipe) maintenanceId: string) {
    return this.tasksService.findAll(maintenanceId);
  }

  @Get(':id')
  @ReadOnlyAccess()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @TechnicalStaff()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTaskDto: UpdateMaintenanceTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.delete(id);
  }

  @Post(':id/assign/:technicianId')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('technicianId', ParseUUIDPipe) technicianId: string
  ) {
    return this.tasksService.assign(id, technicianId);
  }

  @Post('order')
  @TechnicalStaff()
  updateOrder(
    @Param('maintenanceId', ParseUUIDPipe) maintenanceId: string,
    @Body() taskOrders: { id: string; order: number }[]
  ) {
    return this.tasksService.updateOrder(maintenanceId, taskOrders);
  }
}
