import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/types/auth.types';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.create(createNotificationDto);
  }

  @Get()
  async getUserNotifications(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return await this.notificationsService.getUserNotifications(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    return await this.notificationsService.markAsRead(id, req.user.id);
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @Get('preferences')
  async getPreferences(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const preferences = await this.notificationsService.getNotificationPreferences(req.user.id);
    return (
      preferences ?? {
        email_notifications: true,
        in_app_notifications: true,
        push_notifications: false
      }
    );
  }

  @Patch('preferences')
  async updatePreferences(
    @Request() req: RequestWithUser,
    @Body() updatePreferencesDto: UpdateNotificationPreferencesDto
  ) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    await this.notificationsService.updateNotificationPreferences(
      req.user.id,
      updatePreferencesDto
    );
    return { message: 'Notification preferences updated successfully' };
  }
}
