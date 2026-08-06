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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { UpdateOrganizationSecurityPolicyDto } from '../dto/security-policies.dto';
import { SecurityPoliciesService } from '../services/security-policies.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/security-policies')
export class SecurityPoliciesController {
  constructor(private readonly service: SecurityPoliciesService) {}

  @Get()
  @Permissions(Permission.ORGANIZATION_VIEW)
  async getPolicy(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.getPolicy(organizationId),
      'SECURITY_POLICY_FETCHED',
      'security policy fetched',
    );
  }

  @Put()
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async updatePolicy(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateOrganizationSecurityPolicyDto,
  ) {
    return successResponse(
      await this.service.updatePolicy(req.user.sub, dto),
      'SECURITY_POLICY_UPDATED',
      'security policy updated',
    );
  }
}
