import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  track(@Body() dto: TrackEventDto) {
    return this.analyticsService.trackEvent(dto);
  }

  @Get('stats')
  getStats(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getStats(query);
  }
}
