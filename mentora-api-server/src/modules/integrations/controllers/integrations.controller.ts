import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import { UpsertIntegrationProviderDto } from '../dto/integrations.dto';
import { IntegrationsService } from '../services/integrations.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get('providers')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async listProviders(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listProviders(tenantId),
      'CRM_INTEGRATION_PROVIDERS_FETCHED',
      'CRM integration providers fetched',
    );
  }

  @Put('providers/:providerKey')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async upsertProvider(
    @Req() req: AuthenticatedRequest,
    @Param('providerKey') providerKey: string,
    @Body() dto: UpsertIntegrationProviderDto,
  ) {
    return successResponse(
      await this.service.upsertProvider(req.user.sub, providerKey, dto),
      'CRM_INTEGRATION_PROVIDER_UPDATED',
      'CRM integration provider updated',
    );
  }
}
