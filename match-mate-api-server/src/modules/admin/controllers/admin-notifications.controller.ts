import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { CreateNotificationDto } from '@/modules/notifications/dto/create-notification.dto';
import { UpsertNotificationTemplateDto } from '@/modules/notifications/dto/upsert-notification-template.dto';
import { SendTemplateNotificationDto } from '@/modules/notifications/dto/send-template-notification.dto';
import { NotificationAnalyticsQueryDto } from '@/modules/notifications/dto/notification-analytics-query.dto';
import { NotificationDlqQueryDto } from '@/modules/notifications/dto/notification-dlq-query.dto';
import { NotificationDlqReplayAllDto } from '@/modules/notifications/dto/notification-dlq-replay-all.dto';
import { NotificationDlqPurgeDto } from '@/modules/notifications/dto/notification-dlq-purge.dto';
import { AdminAuditService } from '../services/admin-audit.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MARKETING_ADMIN)
export class AdminNotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Post()
  @Permissions(Permission.NOTIFICATION_SEND)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateNotificationDto,
  ) {
    const data = await this.notificationsService.notify(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification.sent',
      resource: 'notification',
      targetId: dto.userId,
      after: {
        title: dto.title,
        category: dto.category,
        channels: dto.channels,
      },
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }

  @Post('dispatch/template')
  @Permissions(Permission.NOTIFICATION_SEND)
  async dispatchTemplate(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendTemplateNotificationDto,
  ) {
    const data = await this.notificationsService.sendTemplateNotification(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification.template_dispatched',
      resource: 'notification_template',
      targetId: dto.templateKey,
      after: { userId: dto.userId, channels: dto.channels },
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }

  @Get('templates')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listTemplates(@Query('includeInactive') includeInactive?: string) {
    return successResponse(
      await this.notificationsService.listTemplates(includeInactive === 'true'),
      SuccessCode.NOTIFICATION_FETCHED,
    );
  }

  @Post('templates/:key')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async upsertTemplate(
    @Req() req: AuthenticatedRequest,
    @Param('key') key: string,
    @Body() dto: UpsertNotificationTemplateDto,
  ) {
    const data = await this.notificationsService.upsertTemplate(key, dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification_template.upserted',
      resource: 'notification_template',
      targetId: key,
      after: data as unknown as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }

  @Get('analytics')
  @Permissions(Permission.ANALYTICS_VIEW)
  async analytics(@Query() query: NotificationAnalyticsQueryDto) {
    return successResponse(
      await this.notificationsService.getAnalytics(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('dlq')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async listDeadLetterJobs(@Query() query: NotificationDlqQueryDto) {
    return successResponse(
      await this.notificationsService.listDeadLetterJobs(query),
      SuccessCode.NOTIFICATION_FETCHED,
    );
  }

  @Get('dlq/:jobId')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async getDeadLetterJob(@Param('jobId') jobId: string) {
    return successResponse(
      await this.notificationsService.getDeadLetterJob(jobId),
      SuccessCode.NOTIFICATION_FETCHED,
    );
  }

  @Post('dlq/:jobId/replay')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async replayDeadLetterJob(
    @Req() req: AuthenticatedRequest,
    @Param('jobId') jobId: string,
  ) {
    const data = await this.notificationsService.replayDeadLetterJob(
      jobId,
      req.user.sub,
    );
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification_dlq.replayed',
      resource: 'notification_dlq',
      targetId: jobId,
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }

  @Post('dlq/replay-all')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async replayAllDeadLetterJobs(
    @Req() req: AuthenticatedRequest,
    @Body() dto: NotificationDlqReplayAllDto,
  ) {
    const data = await this.notificationsService.replayAllDeadLetterJobs(
      dto,
      req.user.sub,
    );
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification_dlq.replay_all',
      resource: 'notification_dlq',
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }

  @Patch('dlq/purge')
  @Permissions(Permission.NOTIFICATION_MANAGE)
  async purgeDeadLetterJobs(
    @Req() req: AuthenticatedRequest,
    @Body() dto: NotificationDlqPurgeDto,
  ) {
    const data = await this.notificationsService.purgeDeadLetterJobs(dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: 'notification_dlq.purged',
      resource: 'notification_dlq',
      after: data as Record<string, unknown>,
    });
    return successResponse(data, SuccessCode.NOTIFICATION_FETCHED);
  }
}
