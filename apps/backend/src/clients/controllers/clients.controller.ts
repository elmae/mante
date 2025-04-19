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
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, AuthorizedRequest } from '../../common/types/auth.types';
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { FilterClientDto } from '../dto/filter-client.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('clients')
@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  async create(@Body() createClientDto: CreateClientDto, @Req() req: AuthorizedRequest) {
    return this.clientsService.create(createClientDto, req.user.id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Actualizar un cliente existente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Req() req: AuthorizedRequest
  ) {
    return this.clientsService.update(id, updateClientDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes obtenida exitosamente' })
  async findAll(@Query() filterDto: FilterClientDto) {
    return this.clientsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado exitosamente' })
  async findById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Get('email/:email')
  @Roles(Role.ADMIN, Role.MANAGER, Role.VIEWER)
  @ApiOperation({ summary: 'Obtener un cliente por email' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado exitosamente' })
  async findByEmail(@Param('email') email: string) {
    return this.clientsService.findByEmail(email);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 204, description: 'Cliente eliminado exitosamente' })
  async delete(@Param('id') id: string) {
    await this.clientsService.delete(id);
  }

  @Put(':id/activate')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activar un cliente' })
  @ApiResponse({ status: 204, description: 'Cliente activado exitosamente' })
  async activate(@Param('id') id: string, @Req() req: AuthorizedRequest) {
    await this.clientsService.activate(id, req.user.id);
  }

  @Put(':id/deactivate')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un cliente' })
  @ApiResponse({ status: 204, description: 'Cliente desactivado exitosamente' })
  async deactivate(@Param('id') id: string, @Req() req: AuthorizedRequest) {
    await this.clientsService.deactivate(id, req.user.id);
  }
}
