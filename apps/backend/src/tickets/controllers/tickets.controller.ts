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
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TicketsService } from '../services/tickets.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto, AssignTicketDto, UpdateTicketStatusDto } from '../dto/update-ticket.dto';
import { TicketFilterDto } from '../dto/filter-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { Comment } from '../../domain/entities/comment.entity';
import { Attachment } from '../../domain/entities/attachment.entity';
import { Role } from '../../common/types/auth.types';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async findAll(@Query() filterDto: TicketFilterDto) {
    return this.ticketsService.list(filterDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return this.ticketsService.findById(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ticketsService.delete(id);
  }

  @Put(':id/assign')
  @Roles(Role.ADMIN)
  async assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignTicketDto: AssignTicketDto
  ): Promise<Ticket> {
    return this.ticketsService.assignTechnician(id, assignTicketDto.technician_id);
  }

  @Put(':id/status')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateTicketStatusDto
  ): Promise<Ticket> {
    return this.ticketsService.updateStatus(id, statusDto.status);
  }

  @Post(':id/comments')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string
  ): Promise<Comment> {
    return this.ticketsService.addComment(id, content);
  }

  @Get(':id/comments')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async getComments(@Param('id', ParseUUIDPipe) id: string): Promise<Comment[]> {
    return this.ticketsService.getComments(id);
  }

  @Post(':id/attachments')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @UseInterceptors(FileInterceptor('file'))
  async addAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: any
  ): Promise<Attachment> {
    const attachmentData = {
      file_name: file.originalname,
      file_path: file.path,
      mime_type: file.mimetype,
      file_size: file.size
    };
    return this.ticketsService.addAttachment(id, attachmentData);
  }

  @Get(':id/attachments')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async getAttachments(@Param('id', ParseUUIDPipe) id: string): Promise<Attachment[]> {
    return this.ticketsService.getAttachments(id);
  }

  @Delete(':id/attachments/:attachmentId')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  async removeAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string
  ): Promise<void> {
    return this.ticketsService.deleteAttachment(id, attachmentId);
  }
}
