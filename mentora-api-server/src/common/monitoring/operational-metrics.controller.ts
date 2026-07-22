import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { SkipRateLimit } from '@/common/decorators/skip-rate-limit.decorator';
import { OperationalMetricsService } from './operational-metrics.service';

@Controller('metrics')
export class OperationalMetricsController {
  constructor(private readonly metrics: OperationalMetricsService) {}

  @Public()
  @SkipThrottle()
  @SkipRateLimit()
  @Get()
  snapshot() {
    return this.metrics.snapshot();
  }
}
