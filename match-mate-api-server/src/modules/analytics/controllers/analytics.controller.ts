import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { TrackEventDto } from '../dto/track-event.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async track(@Body() dto: TrackEventDto) {
    return successResponse(
      await this.analyticsService.trackEvent(dto),
      SuccessCode.ANALYTICS_TRACKED,
    );
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getStats(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getStats(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('overview')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getOverview(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getOverview(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }

  @Get('funnel')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getFunnel(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.analyticsService.getFunnel(query),
      SuccessCode.ANALYTICS_FETCHED,
    );
  }
}
