import {
  Body,
  Controller,
  Get,
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
import { UpdateTenantSecurityPolicyDto } from '../dto/security-policies.dto';
import { SecurityPoliciesService } from '../services/security-policies.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('security-policies')
export class SecurityPoliciesController {
  constructor(private readonly service: SecurityPoliciesService) {}

  @Get()
  @Permissions(Permission.CRM_TENANT_VIEW)
  async getPolicy(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getPolicy(tenantId),
      'CRM_SECURITY_POLICY_FETCHED',
      'CRM security policy fetched',
    );
  }

  @Put()
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async updatePolicy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateTenantSecurityPolicyDto,
  ) {
    return successResponse(
      await this.service.updatePolicy(req.user.sub, dto),
      'CRM_SECURITY_POLICY_UPDATED',
      'CRM security policy updated',
    );
  }
}
