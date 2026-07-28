import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
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
  CreateCampusDto,
  CreateDepartmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTeamDto,
  CreateTenantUserDto,
  CreateTenantDto,
  ListTenantsDto,
  ListTenantUsersDto,
  UpdateTenantDto,
  UpsertChannelSettingDto,
  UpsertTenantBrandingDto,
  UpsertTenantUserDto,
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

  @Put('tenants/:id')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return successResponse(
      await this.service.updateTenant(id, dto),
      'EDUCATION_PLATFORM_TENANT_UPDATED',
      'CRM tenant updated',
    );
  }

  @Get('tenants')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listTenants(@Query() query: ListTenantsDto) {
    return successResponse(
      await this.service.listTenants(query),
      'EDUCATION_PLATFORM_TENANTS_FETCHED',
      'CRM tenants fetched',
    );
  }

  @Delete('tenants/:id')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async archiveTenant(@Param('id') id: string) {
    return successResponse(
      await this.service.archiveTenant(id),
      'EDUCATION_PLATFORM_TENANT_ARCHIVED',
      'CRM tenant archived',
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

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return successResponse(
      await this.service.createDepartment(dto),
      'EDUCATION_PLATFORM_DEPARTMENT_CREATED',
      'CRM department created',
    );
  }

  @Get('departments')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listDepartments(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listDepartments(tenantId),
      'EDUCATION_PLATFORM_DEPARTMENTS_FETCHED',
      'CRM departments fetched',
    );
  }

  @Post('teams')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createTeam(@Body() dto: CreateTeamDto) {
    return successResponse(
      await this.service.createTeam(dto),
      'EDUCATION_PLATFORM_TEAM_CREATED',
      'CRM team created',
    );
  }

  @Get('teams')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listTeams(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listTeams(tenantId),
      'EDUCATION_PLATFORM_TEAMS_FETCHED',
      'CRM teams fetched',
    );
  }

  @Post('campuses')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createCampus(@Body() dto: CreateCampusDto) {
    return successResponse(
      await this.service.createCampus(dto),
      'EDUCATION_PLATFORM_CAMPUS_CREATED',
      'CRM campus created',
    );
  }

  @Get('campuses')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listCampuses(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCampuses(tenantId),
      'EDUCATION_PLATFORM_CAMPUSES_FETCHED',
      'CRM campuses fetched',
    );
  }

  @Post('tenant-branding')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async upsertBranding(@Body() dto: UpsertTenantBrandingDto) {
    return successResponse(
      await this.service.upsertBranding(dto),
      'EDUCATION_PLATFORM_TENANT_BRANDING_UPDATED',
      'CRM tenant branding updated',
    );
  }

  @Get('tenant-branding')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async getBranding(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getBranding(tenantId),
      'EDUCATION_PLATFORM_TENANT_BRANDING_FETCHED',
      'CRM tenant branding fetched',
    );
  }

  @Post('channel-settings')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async upsertChannelSetting(@Body() dto: UpsertChannelSettingDto) {
    return successResponse(
      await this.service.upsertChannelSetting(dto),
      'EDUCATION_PLATFORM_CHANNEL_SETTING_UPDATED',
      'CRM channel setting updated',
    );
  }

  @Get('channel-settings')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listChannelSettings(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listChannelSettings(tenantId),
      'EDUCATION_PLATFORM_CHANNEL_SETTINGS_FETCHED',
      'CRM channel settings fetched',
    );
  }

  @Post('tenant-users')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async upsertTenantUser(@Body() dto: UpsertTenantUserDto) {
    return successResponse(
      await this.service.upsertTenantUser(dto),
      'EDUCATION_PLATFORM_TENANT_USER_UPDATED',
      'CRM tenant user updated',
    );
  }

  @Post('tenant-users/create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async createTenantUser(
    @Body() dto: CreateTenantUserDto,
    @Req() req: { user: { sub: string } },
  ) {
    return successResponse(
      await this.service.createTenantUser(dto, req.user.sub),
      'EDUCATION_PLATFORM_TENANT_USER_CREATED',
      'CRM tenant user created',
    );
  }

  @Get('tenant-users')
  @Permissions(Permission.CRM_TENANT_VIEW)
  async listTenantUsers(@Query() query: ListTenantUsersDto) {
    return successResponse(
      await this.service.listTenantUsers(query),
      'EDUCATION_PLATFORM_TENANT_USERS_FETCHED',
      'CRM tenant users fetched',
    );
  }

  @Patch('tenant-users/:userId/status')
  @Permissions(Permission.CRM_TENANT_MANAGE)
  async updateTenantUserStatus(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId: string,
    @Body('status') status: string,
  ) {
    return successResponse(
      await this.service.updateTenantUserStatus(tenantId, userId, status),
      'EDUCATION_PLATFORM_TENANT_USER_STATUS_UPDATED',
      'CRM tenant user status updated',
    );
  }
}
