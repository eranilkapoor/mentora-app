import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ListNotificationsDto } from '../dto/list-notifications.dto';
import { UpsertNotificationTemplateDto } from '../dto/upsert-notification-template.dto';
import { SendTemplateNotificationDto } from '../dto/send-template-notification.dto';
import { NotificationAnalyticsQueryDto } from '../dto/notification-analytics-query.dto';
import { NotificationDlqQueryDto } from '../dto/notification-dlq-query.dto';
import { NotificationDlqReplayAllDto } from '../dto/notification-dlq-replay-all.dto';
import { NotificationDlqPurgeDto } from '../dto/notification-dlq-purge.dto';
import {
  RegisterDeviceTokenDto,
  RevokeDeviceTokenDto,
} from '../dto/register-device-token.dto';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
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

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_SEND)
  async create(@Body() dto: CreateNotificationDto) {
    const data = await this.service.notify(dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification queued successfully',
    );
  }

  @Post('dispatch/template')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_SEND)
  async dispatchTemplate(@Body() dto: SendTemplateNotificationDto) {
    const data = await this.service.sendTemplateNotification(dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Template notification queued successfully',
    );
  }

  @Get('templates')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listTemplates(@Query('includeInactive') includeInactive?: string) {
    const data = await this.service.listTemplates(includeInactive === 'true');
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Templates fetched successfully',
    );
  }

  @Get('analytics')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.ANALYTICS_VIEW)
  async analytics(@Query() query: NotificationAnalyticsQueryDto) {
    const data = await this.service.getAnalytics(query);
    return successResponse(
      data,
      SuccessCode.ANALYTICS_FETCHED,
      'Notification analytics fetched successfully',
    );
  }

  @Get('dlq')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listDeadLetterJobs(@Query() query: NotificationDlqQueryDto) {
    const data = await this.service.listDeadLetterJobs(query);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification DLQ jobs fetched successfully',
    );
  }

  @Get('dlq/:jobId')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async getDeadLetterJob(@Param('jobId') jobId: string) {
    const data = await this.service.getDeadLetterJob(jobId);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification DLQ job fetched successfully',
    );
  }

  @Post('dlq/:jobId/replay')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async replayDeadLetterJob(
    @Param('jobId') jobId: string,
    @CurrentUser('sub') adminUserId: string,
  ) {
    const data = await this.service.replayDeadLetterJob(jobId, adminUserId);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification DLQ job replay queued successfully',
    );
  }

  @Post('dlq/replay-all')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async replayAllDeadLetterJobs(
    @Body() dto: NotificationDlqReplayAllDto,
    @CurrentUser('sub') adminUserId: string,
  ) {
    const data = await this.service.replayAllDeadLetterJobs(dto, adminUserId);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification DLQ bulk replay queued successfully',
    );
  }

  @Patch('dlq/purge')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async purgeDeadLetterJobs(@Body() dto: NotificationDlqPurgeDto) {
    const data = await this.service.purgeDeadLetterJobs(dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Notification DLQ purge completed successfully',
    );
  }

  @Post('templates/:key')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async upsertTemplate(
    @Param('key') key: string,
    @Body() dto: UpsertNotificationTemplateDto,
  ) {
    const data = await this.service.upsertTemplate(key, dto);
    return successResponse(
      data,
      SuccessCode.NOTIFICATION_FETCHED,
      'Template saved successfully',
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
