import { Controller, Get, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query('unreadOnly') unreadOnly?: boolean) { return this.svc.findByUser(userId, unreadOnly); }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.svc.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.svc.markRead(id, userId); }

  @Patch('read-all')
  markAllRead(@CurrentUser('id') userId: string) { return this.svc.markAllRead(userId); }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.svc.remove(id, userId); }
}
