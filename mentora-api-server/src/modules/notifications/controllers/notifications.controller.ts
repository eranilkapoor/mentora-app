import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ListNotificationsDto } from '../dto/list-notifications.dto';
import {
  RegisterDeviceTokenDto,
  RevokeDeviceTokenDto,
} from '../dto/register-device-token.dto';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: ListNotificationsDto,
  ) {
    const data = await this.service.getUserNotifications(userId, query);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notifications fetched successfully',
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const data = await this.service.getUnreadCount(userId);
    return successResponse(
      { unreadCount: data },
      SuccessCode.NOTIFICATION_FETCHED,
      'Unread count fetched successfully',
    );
  }

  @Post('device-tokens')
  async registerDeviceToken(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    const data = await this.service.registerDeviceToken(userId, dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_DEVICE_TOKEN_REGISTERED,
      'Notification device token registered successfully',
    );
  }

  @Post('device-tokens/revoke')
  async revokeDeviceToken(
    @CurrentUser('sub') userId: string,
    @Body() dto: RevokeDeviceTokenDto,
  ) {
    const data = await this.service.revokeDeviceToken(userId, dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_DEVICE_TOKEN_REMOVED,
      'Notification device token removed successfully',
    );
  }

  @Post(':id/read')
  async markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const data = await this.service.markRead(userId, id);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_READ,
      'Notification marked as read',
    );
  }

  @Post('read-all')
  async markAllRead(@CurrentUser('sub') userId: string) {
    const data = await this.service.markAllRead(userId);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_ALL_READ,
      'All notifications marked as read',
    );
  }
}
