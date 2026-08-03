import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { DashboardService } from '../services/dashboard.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('bootstrap')
  @Permissions(Permission.DASHBOARD_VIEW)
  async bootstrap(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId?: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.getBootstrap(
        req.user.sub,
        organizationId,
        req.user.roles,
      ),
      'EDUCATION_PLATFORM_DASHBOARD_BOOTSTRAPPED',
      'CRM dashboard bootstrap fetched',
    );
  }

  @Get()
  @Permissions(Permission.DASHBOARD_VIEW)
  async dashboard(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.getDashboard(organizationId),
      'EDUCATION_PLATFORM_DASHBOARD_FETCHED',
      'CRM dashboard fetched',
    );
  }
}
