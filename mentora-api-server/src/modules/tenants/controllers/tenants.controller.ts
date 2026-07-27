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
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  CreateBranchDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTenantDto,
} from '../dto/tenants.dto';
import { TenantsService } from '../services/tenants.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() dto: CreateTenantDto) {
    return successResponse(
      await this.service.createTenant(dto),
      'EDUCATION_PLATFORM_TENANT_CREATED',
      'CRM tenant created',
    );
  }

  @Get('tenants')
  async listTenants() {
    return successResponse(
      await this.service.listTenants(),
      'EDUCATION_PLATFORM_TENANTS_FETCHED',
      'CRM tenants fetched',
    );
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  async createBranch(@Body() dto: CreateBranchDto) {
    return successResponse(
      await this.service.createBranch(dto),
      'EDUCATION_PLATFORM_BRANCH_CREATED',
      'CRM branch created',
    );
  }

  @Get('branches')
  async listBranches(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listBranches(tenantId),
      'EDUCATION_PLATFORM_BRANCHES_FETCHED',
      'CRM branches fetched',
    );
  }

  @Post('lead-sources')
  @HttpCode(HttpStatus.CREATED)
  async createLeadSource(@Body() dto: CreateLeadSourceDto) {
    return successResponse(
      await this.service.createLeadSource(dto),
      'EDUCATION_PLATFORM_LEAD_SOURCE_CREATED',
      'CRM lead source created',
    );
  }

  @Get('lead-sources')
  async listLeadSources(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadSources(tenantId),
      'EDUCATION_PLATFORM_LEAD_SOURCES_FETCHED',
      'CRM lead sources fetched',
    );
  }

  @Post('lead-stages')
  @HttpCode(HttpStatus.CREATED)
  async createLeadStage(@Body() dto: CreateLeadStageDto) {
    return successResponse(
      await this.service.createLeadStage(dto),
      'EDUCATION_PLATFORM_LEAD_STAGE_CREATED',
      'CRM lead stage created',
    );
  }

  @Get('lead-stages')
  async listLeadStages(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadStages(tenantId),
      'EDUCATION_PLATFORM_LEAD_STAGES_FETCHED',
      'CRM lead stages fetched',
    );
  }
}
