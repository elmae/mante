import { Controller, Put, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CommentsService } from '../services/comments.service';
import { UpdateTicketCommentDto, UpdateMaintenanceCommentDto } from '../dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Comentarios')
@Controller('comments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Put('ticket/:id')
  @Roles('SUPERVISOR', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar un comentario de ticket' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ type: UpdateTicketCommentDto })
  async updateTicketComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateTicketCommentDto,
    @GetUser('id') userId: string
  ) {
    return this.commentsService.updateTicketComment(id, updateCommentDto, userId);
  }

  @Delete('ticket/:id')
  @Roles('SUPERVISOR', 'TECHNICIAN')
  @ApiOperation({ summary: 'Eliminar un comentario de ticket' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  async deleteTicketComment(@Param('id', ParseUUIDPipe) id: string, @GetUser('id') userId: string) {
    await this.commentsService.deleteTicketComment(id, userId);
    return { message: 'Comentario eliminado exitosamente' };
  }

  @Put('maintenance/:id')
  @Roles('SUPERVISOR', 'TECHNICIAN')
  @ApiOperation({ summary: 'Actualizar un comentario de mantenimiento' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ type: UpdateMaintenanceCommentDto })
  async updateMaintenanceComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateMaintenanceCommentDto,
    @GetUser('id') userId: string
  ) {
    return this.commentsService.updateMaintenanceComment(id, updateCommentDto, userId);
  }

  @Delete('maintenance/:id')
  @Roles('SUPERVISOR', 'TECHNICIAN')
  @ApiOperation({ summary: 'Eliminar un comentario de mantenimiento' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  async deleteMaintenanceComment(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string
  ) {
    await this.commentsService.deleteMaintenanceComment(id, userId);
    return { message: 'Comentario eliminado exitosamente' };
  }
}
