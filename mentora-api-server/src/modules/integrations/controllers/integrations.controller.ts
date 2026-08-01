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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { UpsertIntegrationProviderDto } from '../dto/integrations.dto';
import { IntegrationsService } from '../services/integrations.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get('providers')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async listProviders(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.listProviders(organizationId),
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

  @Get('providers/:providerKey/test')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  testProvider(
    @Param('providerKey') providerKey: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      this.service.testProvider(organizationId, providerKey),
      'CRM_INTEGRATION_PROVIDER_TESTED',
      'CRM integration provider tested',
    );
  }
}
