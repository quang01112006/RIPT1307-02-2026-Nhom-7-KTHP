import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('page')
  getMyNotifications(@Request() req: any) {
    return this.notificationsService.findByUser(req.user._id);
  }
  @Patch('read-all')
  readAll(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user._id);
  }

  @Delete('all')
  deleteAll(@Request() req: any) {
    return this.notificationsService.deleteAll(req.user._id);
  }

  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(':id/unread')
  unread(@Param('id') id: string) {
    return this.notificationsService.markAsUnread(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }
}
