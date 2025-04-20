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
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { FilterTicketDto } from '../dto/filter-ticket.dto';
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

@Controller('tickets')
@UseGuards(AuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @TechnicalStaff()
  create(@Body() createTicketDto: CreateTicketDto, @GetUser() user: User) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @ReadOnlyAccess()
  findAll(@Query() filterDto: FilterTicketDto) {
    return this.ticketsService.findAll(filterDto);
  }

  @Get(':id')
  @ReadOnlyAccess()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findById(id);
  }

  @Patch(':id')
  @TechnicalStaff()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @AdminOnly()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.delete(id);
  }

  @Get(':id/comments')
  @TechnicalStaff()
  getComments(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findComments(id);
  }

  @Post(':id/assign/:technicianId')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('technicianId', ParseUUIDPipe) technicianId: string
  ) {
    return this.ticketsService.assignTechnician(id, technicianId);
  }
}
