import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { TrackEventDto } from '../dto/track-event.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums';

@Controller('analytics')
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @Roles(Role.ADMIN, Role.MODERATOR)
  track(@Body() dto: TrackEventDto) {
    return this.analyticsService.trackEvent(dto);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getStats(query);
  }

  @Get('overview')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOverview(query);
  }

  @Get('funnel')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getFunnel(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFunnel(query);
  }
}
