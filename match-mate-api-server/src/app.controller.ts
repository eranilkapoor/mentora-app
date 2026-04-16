import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ==========================================
  // ROOT (basic info)
  // ==========================================
  @Public()
  @Get()
  getRoot() {
    return this.appService.getRoot();
  }

  // ==========================================
  // HEALTH CHECK (important for prod)
  // ==========================================
  @Public()
  @Get('health')
  check() {
    return this.appService.healthCheck();
  }
}
