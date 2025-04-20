import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe
} from '@nestjs/common';
import { AtmsService } from '../services/atms.service';
import { CreateAtmDto } from '../dto/create-atm.dto';
import { UpdateAtmDto } from '../dto/update-atm.dto';
import { FilterAtmDto } from '../dto/filter-atm.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles, AdminAndManager, ReadOnlyAccess } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/types/roles.types';
import { ATM } from '../../domain/entities';

@Controller('atms')
@UseGuards(AuthGuard)
export class AtmsController {
  constructor(private readonly atmsService: AtmsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createAtmDto: CreateAtmDto): Promise<ATM> {
    return this.atmsService.create(createAtmDto);
  }

  @Get()
  @ReadOnlyAccess()
  async findAll(@Query() filterDto: FilterAtmDto) {
    return this.atmsService.findAll(filterDto);
  }

  @Get(':id')
  @ReadOnlyAccess()
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ATM> {
    return this.atmsService.findOne(id);
  }

  @Patch(':id')
  @AdminAndManager()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAtmDto: UpdateAtmDto
  ): Promise<ATM> {
    return this.atmsService.update(id, updateAtmDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.atmsService.remove(id);
  }

  @Get(':id/maintenance-history')
  @ReadOnlyAccess()
  async getMaintenanceHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.atmsService.findOne(id);
  }

  @Get(':id/performance-metrics')
  @ReadOnlyAccess()
  async getPerformanceMetrics(@Param('id', ParseUUIDPipe) id: string) {
    const atm = await this.atmsService.findOne(id);
    return atm.performanceMetrics;
  }

  @Get(':id/inventory-status')
  @ReadOnlyAccess()
  async getInventoryStatus(@Param('id', ParseUUIDPipe) id: string) {
    const atm = await this.atmsService.findOne(id);
    return atm.inventoryStatus;
  }

  @Get(':id/software-status')
  @ReadOnlyAccess()
  async getSoftwareStatus(@Param('id', ParseUUIDPipe) id: string) {
    const atm = await this.atmsService.findOne(id);
    return atm.softwareUpdates;
  }
}
