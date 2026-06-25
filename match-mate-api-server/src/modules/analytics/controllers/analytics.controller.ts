import { Body, Controller, Post, Req } from '@nestjs/common';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { AnalyticsService } from '../services/analytics.service';
import { TrackEventDto } from '../dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async track(@Req() req: AuthenticatedRequest, @Body() dto: TrackEventDto) {
    const platformHeader = req.headers['x-platform'];
    const platform =
      typeof platformHeader === 'string'
        ? platformHeader.toLowerCase()
        : Array.isArray(platformHeader)
          ? String(platformHeader[0] ?? '').toLowerCase()
          : undefined;

    const rawUserAgent = req.headers['user-agent'];
    const userAgent =
      typeof rawUserAgent === 'string' ? rawUserAgent : rawUserAgent?.[0];

    const data = await this.analyticsService.trackEvent({
      ...dto,
      userId: req.user.sub,
      ipAddress: req.ip,
      userAgent,
      platform: dto.platform ?? (platform as TrackEventDto['platform']),
    });

    return successResponse(data, SuccessCode.ANALYTICS_TRACKED);
  }
}
