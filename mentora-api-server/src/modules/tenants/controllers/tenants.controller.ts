import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  CreateBranchDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTenantDto,
} from '../dto/tenants.dto';
import { TenantsService } from '../services/tenants.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller()
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createTenant(@Body() dto: CreateTenantDto) {
    return successResponse(
      await this.service.createTenant(dto),
      'EDUCATION_PLATFORM_TENANT_CREATED',
      'CRM tenant created',
    );
  }

  @Get('tenants')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listTenants() {
    return successResponse(
      await this.service.listTenants(),
      'EDUCATION_PLATFORM_TENANTS_FETCHED',
      'CRM tenants fetched',
    );
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createBranch(@Body() dto: CreateBranchDto) {
    return successResponse(
      await this.service.createBranch(dto),
      'EDUCATION_PLATFORM_BRANCH_CREATED',
      'CRM branch created',
    );
  }

  @Get('branches')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listBranches(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listBranches(tenantId),
      'EDUCATION_PLATFORM_BRANCHES_FETCHED',
      'CRM branches fetched',
    );
  }

  @Post('lead-sources')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createLeadSource(@Body() dto: CreateLeadSourceDto) {
    return successResponse(
      await this.service.createLeadSource(dto),
      'EDUCATION_PLATFORM_LEAD_SOURCE_CREATED',
      'CRM lead source created',
    );
  }

  @Get('lead-sources')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listLeadSources(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadSources(tenantId),
      'EDUCATION_PLATFORM_LEAD_SOURCES_FETCHED',
      'CRM lead sources fetched',
    );
  }

  @Post('lead-stages')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createLeadStage(@Body() dto: CreateLeadStageDto) {
    return successResponse(
      await this.service.createLeadStage(dto),
      'EDUCATION_PLATFORM_LEAD_STAGE_CREATED',
      'CRM lead stage created',
    );
  }

  @Get('lead-stages')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listLeadStages(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadStages(tenantId),
      'EDUCATION_PLATFORM_LEAD_STAGES_FETCHED',
      'CRM lead stages fetched',
    );
  }
}
