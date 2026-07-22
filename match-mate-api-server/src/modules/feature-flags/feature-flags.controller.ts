import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { FeatureFlagsService } from './feature-flags.service';

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  getPublicFlags() {
    return {
      generatedAt: new Date().toISOString(),
      flags: this.featureFlagsService.getPublicFlags(),
    };
  }
}
