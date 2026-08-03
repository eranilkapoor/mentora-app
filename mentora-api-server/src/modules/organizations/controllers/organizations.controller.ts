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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTeamDto,
  CreateOrganizationUserDto,
  CreateOrganizationDto,
  ListOrganizationStructureDto,
  ListOrganizationsDto,
  ListOrganizationUsersDto,
  UpdateOrganizationDto,
  UpsertChannelSettingDto,
  UpsertOrganizationBrandingDto,
  UpsertOrganizationUserDto,
} from '../dto/organizations.dto';
import { OrganizationsService } from '../services/organizations.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return successResponse(
      await this.service.createOrganization(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_CREATED',
      'CRM organization created',
    );
  }

  @Put('organizations/:id')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return successResponse(
      await this.service.updateOrganization(id, dto),
      'EDUCATION_PLATFORM_ORGANIZATION_UPDATED',
      'CRM organization updated',
    );
  }

  @Get('organizations')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listOrganizations(
    @Query() query: ListOrganizationsDto,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listOrganizations(query),
      'EDUCATION_PLATFORM_ORGANIZATIONS_FETCHED',
      'CRM organizations fetched',
    );
  }

  @Delete('organizations/:id')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async archiveOrganization(@Param('id') id: string) {
    return successResponse(
      await this.service.archiveOrganization(id),
      'EDUCATION_PLATFORM_ORGANIZATION_ARCHIVED',
      'CRM organization archived',
    );
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createBranch(@Body() dto: CreateBranchDto) {
    return successResponse(
      await this.service.createBranch(dto),
      'EDUCATION_PLATFORM_BRANCH_CREATED',
      'CRM branch created',
    );
  }

  @Get('identity/hierarchy')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async getIdentityHierarchy(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.getIdentityHierarchy(query.organizationId),
      'EDUCATION_PLATFORM_IDENTITY_HIERARCHY_FETCHED',
      'CRM identity hierarchy fetched',
    );
  }

  @Get('branches')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listBranches(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listBranches(query),
      'EDUCATION_PLATFORM_BRANCHES_FETCHED',
      'CRM branches fetched',
    );
  }

  @Delete('branches/:id')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async archiveBranch(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateBranchStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_BRANCH_ARCHIVED',
      'CRM branch archived',
    );
  }

  @Post('branches/:id/restore')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async restoreBranch(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateBranchStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_BRANCH_RESTORED',
      'CRM branch restored',
    );
  }

  @Post('lead-sources')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createLeadSource(@Body() dto: CreateLeadSourceDto) {
    return successResponse(
      await this.service.createLeadSource(dto),
      'EDUCATION_PLATFORM_LEAD_SOURCE_CREATED',
      'CRM lead source created',
    );
  }

  @Get('lead-sources')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listLeadSources(
    @Query('organizationId') organizationId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listLeadSources(organizationId),
      'EDUCATION_PLATFORM_LEAD_SOURCES_FETCHED',
      'CRM lead sources fetched',
    );
  }

  @Post('lead-stages')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createLeadStage(@Body() dto: CreateLeadStageDto) {
    return successResponse(
      await this.service.createLeadStage(dto),
      'EDUCATION_PLATFORM_LEAD_STAGE_CREATED',
      'CRM lead stage created',
    );
  }

  @Get('lead-stages')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listLeadStages(
    @Query('organizationId') organizationId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listLeadStages(organizationId),
      'EDUCATION_PLATFORM_LEAD_STAGES_FETCHED',
      'CRM lead stages fetched',
    );
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return successResponse(
      await this.service.createDepartment(dto),
      'EDUCATION_PLATFORM_DEPARTMENT_CREATED',
      'CRM department created',
    );
  }

  @Get('departments')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listDepartments(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listDepartments(query),
      'EDUCATION_PLATFORM_DEPARTMENTS_FETCHED',
      'CRM departments fetched',
    );
  }

  @Delete('departments/:id')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async archiveDepartment(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateDepartmentStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_DEPARTMENT_ARCHIVED',
      'CRM department archived',
    );
  }

  @Post('departments/:id/restore')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async restoreDepartment(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateDepartmentStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_DEPARTMENT_RESTORED',
      'CRM department restored',
    );
  }

  @Post('teams')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createTeam(@Body() dto: CreateTeamDto) {
    return successResponse(
      await this.service.createTeam(dto),
      'EDUCATION_PLATFORM_TEAM_CREATED',
      'CRM team created',
    );
  }

  @Get('teams')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listTeams(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listTeams(query),
      'EDUCATION_PLATFORM_TEAMS_FETCHED',
      'CRM teams fetched',
    );
  }

  @Delete('teams/:id')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async archiveTeam(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateTeamStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_TEAM_ARCHIVED',
      'CRM team archived',
    );
  }

  @Post('teams/:id/restore')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async restoreTeam(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateTeamStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_TEAM_RESTORED',
      'CRM team restored',
    );
  }

  @Post('organization-branding')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async upsertBranding(@Body() dto: UpsertOrganizationBrandingDto) {
    return successResponse(
      await this.service.upsertBranding(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_BRANDING_UPDATED',
      'CRM organization branding updated',
    );
  }

  @Get('organization-branding')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async getBranding(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.getBranding(organizationId),
      'EDUCATION_PLATFORM_ORGANIZATION_BRANDING_FETCHED',
      'CRM organization branding fetched',
    );
  }

  @Post('channel-settings')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async upsertChannelSetting(@Body() dto: UpsertChannelSettingDto) {
    return successResponse(
      await this.service.upsertChannelSetting(dto),
      'EDUCATION_PLATFORM_CHANNEL_SETTING_UPDATED',
      'CRM channel setting updated',
    );
  }

  @Get('channel-settings')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listChannelSettings(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.listChannelSettings(organizationId),
      'EDUCATION_PLATFORM_CHANNEL_SETTINGS_FETCHED',
      'CRM channel settings fetched',
    );
  }

  @Post('organization-users')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async upsertOrganizationUser(@Body() dto: UpsertOrganizationUserDto) {
    return successResponse(
      await this.service.upsertOrganizationUser(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_USER_UPDATED',
      'CRM organization user updated',
    );
  }

  @Post('organization-users/create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async createOrganizationUser(
    @Body() dto: CreateOrganizationUserDto,
    @Req() req: { user: { sub: string } },
  ) {
    return successResponse(
      await this.service.createOrganizationUser(dto, req.user.sub),
      'EDUCATION_PLATFORM_ORGANIZATION_USER_CREATED',
      'CRM organization user created',
    );
  }

  @Get('organization-users')
  @Permissions(Permission.CRM_ORGANIZATION_VIEW)
  async listOrganizationUsers(@Query() query: ListOrganizationUsersDto) {
    return successResponse(
      await this.service.listOrganizationUsers(query),
      'EDUCATION_PLATFORM_ORGANIZATION_USERS_FETCHED',
      'CRM organization users fetched',
    );
  }

  @Patch('organization-users/:userId/status')
  @Permissions(Permission.CRM_ORGANIZATION_MANAGE)
  async updateOrganizationUserStatus(
    @Param('userId') userId: string,
    @Query('organizationId') organizationId: string,
    @Body('status') status: string,
  ) {
    return successResponse(
      await this.service.updateOrganizationUserStatus(
        organizationId,
        userId,
        status,
      ),
      'EDUCATION_PLATFORM_ORGANIZATION_USER_STATUS_UPDATED',
      'CRM organization user status updated',
    );
  }
}
