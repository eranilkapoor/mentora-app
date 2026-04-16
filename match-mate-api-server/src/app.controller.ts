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
    return {
      message: 'Matrimony API is running 🚀',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // HEALTH CHECK (important for prod)
  // ==========================================
  @Public()
  @Get('health')
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
      },
    };
  }
}
