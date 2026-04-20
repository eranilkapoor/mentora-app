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
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from 'src/common/dto/response.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpsertNotificationTemplateDto } from './dto/upsert-notification-template.dto';
import { SendTemplateNotificationDto } from './dto/send-template-notification.dto';
import { NotificationAnalyticsQueryDto } from './dto/notification-analytics-query.dto';
import { NotificationDlqQueryDto } from './dto/notification-dlq-query.dto';
import { NotificationDlqReplayAllDto } from './dto/notification-dlq-replay-all.dto';
import { NotificationDlqPurgeDto } from './dto/notification-dlq-purge.dto';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { Permission } from 'src/common/enums';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async getMyNotifications(
    @CurrentUser('sub') userId: string,
    @Query() query: ListNotificationsDto,
  ) {
    const data = await this.service.getUserNotifications(userId, query);
    return new ApiResponse(true, 'Notifications fetched successfully', data);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const data = await this.service.getUnreadCount(userId);
    return new ApiResponse(true, 'Unread count fetched successfully', {
      unreadCount: data,
    });
  }

  @Get('settings')
  async getSettings(@CurrentUser('sub') userId: string) {
    const data = await this.service.getSettings(userId);
    return new ApiResponse(
      true,
      'Notification settings fetched successfully',
      data,
    );
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    const data = await this.service.updateSettings(userId, dto);
    return new ApiResponse(true, 'Notification settings updated', data);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_SEND)
  async create(@Body() dto: CreateNotificationDto) {
    const data = await this.service.notify(dto);
    return new ApiResponse(true, 'Notification queued successfully', data);
  }

  @Post('dispatch/template')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_SEND)
  async dispatchTemplate(@Body() dto: SendTemplateNotificationDto) {
    const data = await this.service.sendTemplateNotification(dto);
    return new ApiResponse(
      true,
      'Template notification queued successfully',
      data,
    );
  }

  @Get('templates')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listTemplates(@Query('includeInactive') includeInactive?: string) {
    const data = await this.service.listTemplates(includeInactive === 'true');
    return new ApiResponse(true, 'Templates fetched successfully', data);
  }

  @Get('analytics')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.ANALYTICS_VIEW)
  async analytics(@Query() query: NotificationAnalyticsQueryDto) {
    const data = await this.service.getAnalytics(query);
    return new ApiResponse(
      true,
      'Notification analytics fetched successfully',
      data,
    );
  }

  @Get('dlq')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listDeadLetterJobs(@Query() query: NotificationDlqQueryDto) {
    const data = await this.service.listDeadLetterJobs(query);
    return new ApiResponse(
      true,
      'Notification DLQ jobs fetched successfully',
      data,
    );
  }

  @Get('dlq/:jobId')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async getDeadLetterJob(@Param('jobId') jobId: string) {
    const data = await this.service.getDeadLetterJob(jobId);
    return new ApiResponse(
      true,
      'Notification DLQ job fetched successfully',
      data,
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
    return new ApiResponse(
      true,
      'Notification DLQ job replay queued successfully',
      data,
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
    return new ApiResponse(
      true,
      'Notification DLQ bulk replay queued successfully',
      data,
    );
  }

  @Patch('dlq/purge')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async purgeDeadLetterJobs(@Body() dto: NotificationDlqPurgeDto) {
    const data = await this.service.purgeDeadLetterJobs(dto);
    return new ApiResponse(
      true,
      'Notification DLQ purge completed successfully',
      data,
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
    return new ApiResponse(true, 'Template saved successfully', data);
  }

  @Post(':id/read')
  async markRead(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    const data = await this.service.markRead(userId, id);
    return new ApiResponse(true, 'Notification marked as read', data);
  }

  @Post('read-all')
  async markAllRead(@CurrentUser('sub') userId: string) {
    const data = await this.service.markAllRead(userId);
    return new ApiResponse(true, 'All notifications marked as read', data);
  }
}
