import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import { DashboardService } from '../services/dashboard.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('bootstrap')
  @Permissions(Permission.DASHBOARD_VIEW)
  async bootstrap(
    @Req() req: AuthenticatedRequest,
    @Query('tenantId') tenantId?: string,
  ) {
    return successResponse(
      await this.service.getBootstrap(req.user.sub, tenantId),
      'EDUCATION_PLATFORM_DASHBOARD_BOOTSTRAPPED',
      'CRM dashboard bootstrap fetched',
    );
  }

  @Get()
  @Permissions(Permission.DASHBOARD_VIEW)
  async dashboard(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getDashboard(tenantId),
      'EDUCATION_PLATFORM_DASHBOARD_FETCHED',
      'CRM dashboard fetched',
    );
  }
}
