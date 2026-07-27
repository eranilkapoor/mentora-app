import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  async dashboard(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getDashboard(tenantId),
      'EDUCATION_PLATFORM_DASHBOARD_FETCHED',
      'CRM dashboard fetched',
    );
  }
}
