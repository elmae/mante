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
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AtmsService } from '../services/atms.service';
import { CreateAtmDto } from '../dto/create-atm.dto';
import { UpdateAtmDto } from '../dto/update-atm.dto';
import { FilterAtmDto } from '../dto/filter-atm.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthorizedRequest } from '../../common/types/auth.types';

@Controller('atms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AtmsController {
  constructor(private readonly atmsService: AtmsService) {}

  @Post()
  @Roles('admin', 'operator')
  async create(@Body() createAtmDto: CreateAtmDto, @Req() req: AuthorizedRequest) {
    return await this.atmsService.create(createAtmDto, req.user.id);
  }

  @Get()
  async findAll(@Query() filterDto: FilterAtmDto) {
    const [atms, total] = await this.atmsService.findAll(filterDto);
    return {
      data: atms,
      total,
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
      totalPages: Math.ceil(total / (filterDto.limit || 10))
    };
  }

  @Get('proximity')
  async findByProximity(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 5
  ) {
    return await this.atmsService.findByProximity(latitude, longitude, radius);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.atmsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'operator')
  async update(
    @Param('id') id: string,
    @Body() updateAtmDto: UpdateAtmDto,
    @Req() req: AuthorizedRequest
  ) {
    return await this.atmsService.update(id, updateAtmDto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.atmsService.remove(id);
  }
}
