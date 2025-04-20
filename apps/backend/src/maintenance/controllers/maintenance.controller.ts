import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe
} from '@nestjs/common';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { FilterMaintenanceDto } from '../dto/filter-maintenance.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  Roles,
  AdminOnly,
  TechnicalStaff,
  ReadOnlyAccess,
  AdminAndManager
} from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.types';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../domain/entities';

@Controller('maintenance')
@UseGuards(AuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @TechnicalStaff()
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @GetUser() user: User) {
    return this.maintenanceService.create(createMaintenanceDto, user);
  }

  @Get()
  @ReadOnlyAccess()
  findAll(@Query() filterDto: FilterMaintenanceDto) {
    return this.maintenanceService.findAll(filterDto);
  }

  @Get(':id')
  @ReadOnlyAccess()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @TechnicalStaff()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @AdminOnly()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.delete(id);
  }

  @Get(':id/parts')
  @ReadOnlyAccess()
  getParts(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.findParts(id);
  }

  @Post(':id/parts')
  @TechnicalStaff()
  addParts(@Param('id', ParseUUIDPipe) id: string, @Body() parts: any[]) {
    return this.maintenanceService.addParts(id, parts);
  }

  @Get(':id/comments')
  @ReadOnlyAccess()
  getComments(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.findComments(id);
  }

  @Post(':id/comments')
  @TechnicalStaff()
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string,
    @GetUser() user: User
  ) {
    return this.maintenanceService.addComment(id, {
      content,
      created_by: user
    });
  }

  @Post(':id/assign/:technicianId')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('technicianId', ParseUUIDPipe) technicianId: string
  ) {
    return this.maintenanceService.assignTechnician(id, technicianId);
  }
}
