import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission, Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';
import { TrackEventDto } from '@/modules/analytics/dto/track-event.dto';
import { AnalyticsQueryDto } from '@/modules/analytics/dto/analytics-query.dto';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE, Role.MARKETING_ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @Permissions(Permission.ANALYTICS_VIEW)
  async track(@Body() dto: TrackEventDto) {
    return successResponse(
      await this.analyticsService.trackEvent(dto),
      SuccessCode.ANALYTICS_TRACKED,
    );
  }

  @Get('stats')
  @Permissions(Permission.ANALYTICS_VIEW)
  async getStats(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getStats(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('overview')
  @Permissions(Permission.ANALYTICS_VIEW)
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getOverview(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('funnel')
  @Permissions(Permission.ANALYTICS_VIEW)
  async getFunnel(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getFunnel(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }
}
