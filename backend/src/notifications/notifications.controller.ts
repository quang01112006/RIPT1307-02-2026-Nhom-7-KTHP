import { Controller, Get, Param, Patch, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('page')
  getMyNotifications(@Request() req: any) {
    return this.notificationsService.findByUser(req.user._id);
  }
  @Patch(':id/read')
  read(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
