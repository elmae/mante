import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/auth.types';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { FilterMaintenanceDto } from '../dto/filter-maintenance.dto';
import { User } from '../../domain/entities/user.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('maintenance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async create(@Body() createMaintenanceDto: CreateMaintenanceDto, @GetUser() user: User) {
    return this.maintenanceService.create({
      ...createMaintenanceDto,
      created_by: user
    });
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN, Role.MANAGER, Role.VIEWER)
  async findAll(@Query() filterDto: FilterMaintenanceDto) {
    return this.maintenanceService.findAll(filterDto);
  }

  @Get('stats/in-progress')
  @Roles(Role.ADMIN, Role.MANAGER)
  async getInProgressMaintenances() {
    return this.maintenanceService.findInProgress();
  }

  @Get('stats/follow-up')
  @Roles(Role.ADMIN, Role.MANAGER)
  async getRequiringFollowUp() {
    return this.maintenanceService.findRequiringFollowUp();
  }

  @Get('atm/:atmId')
  @Roles(Role.ADMIN, Role.TECHNICIAN, Role.MANAGER, Role.VIEWER)
  async getMaintenancesByATM(@Param('atmId', ParseUUIDPipe) atmId: string) {
    return this.maintenanceService.findByATM(atmId);
  }

  @Get('technician/:technicianId')
  @Roles(Role.ADMIN, Role.MANAGER)
  async getMaintenancesByTechnician(@Param('technicianId', ParseUUIDPipe) technicianId: string) {
    return this.maintenanceService.findByTechnician(technicianId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN, Role.MANAGER, Role.VIEWER)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const maintenance = await this.maintenanceService.findOne(id);
    if (!maintenance) {
      throw new NotFoundException(`Maintenance #${id} not found`);
    }
    return maintenance;
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.maintenanceService.delete(id);
    return { message: 'Maintenance record deleted successfully' };
  }
}
