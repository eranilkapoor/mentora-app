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
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission, Role } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
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
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return successResponse(
      await this.service.createOrganization(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_CREATED',
      'Organization created',
    );
  }

  @Put('organizations/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return successResponse(
      await this.service.updateOrganization(id, dto),
      'EDUCATION_PLATFORM_ORGANIZATION_UPDATED',
      'Organization updated',
    );
  }

  @Get('organizations')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listOrganizations(
    @Query() query: ListOrganizationsDto,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listOrganizations(query),
      'EDUCATION_PLATFORM_ORGANIZATIONS_FETCHED',
      'Organizations fetched',
    );
  }

  @Get('organizations/operations/export')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportOrganizations() {
    return successResponse(
      await this.service.exportOrganizations(),
      'EDUCATION_PLATFORM_ORGANIZATIONS_EXPORTED',
      'Organizations exported',
    );
  }

  @Delete('organizations/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async archiveOrganization(@Param('id') id: string) {
    return successResponse(
      await this.service.archiveOrganization(id),
      'EDUCATION_PLATFORM_ORGANIZATION_ARCHIVED',
      'Organization archived',
    );
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createBranch(@Body() dto: CreateBranchDto) {
    return successResponse(
      await this.service.createBranch(dto),
      'EDUCATION_PLATFORM_BRANCH_CREATED',
      'Branch created',
    );
  }

  @Get('identity/hierarchy')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async getIdentityHierarchy(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.getIdentityHierarchy(query.organizationId),
      'EDUCATION_PLATFORM_IDENTITY_HIERARCHY_FETCHED',
      'Identity hierarchy fetched',
    );
  }

  @Get('branches')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listBranches(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listBranches(query),
      'EDUCATION_PLATFORM_BRANCHES_FETCHED',
      'Branches fetched',
    );
  }

  @Get('branches/operations/export')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportBranches(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportBranches(organizationId),
      'EDUCATION_PLATFORM_BRANCHES_EXPORTED',
      'Branches exported',
    );
  }

  @Delete('branches/:id')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async archiveBranch(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateBranchStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_BRANCH_ARCHIVED',
      'Branch archived',
    );
  }

  @Post('branches/:id/restore')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async restoreBranch(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateBranchStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_BRANCH_RESTORED',
      'Branch restored',
    );
  }

  @Post('lead-sources')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createLeadSource(@Body() dto: CreateLeadSourceDto) {
    return successResponse(
      await this.service.createLeadSource(dto),
      'EDUCATION_PLATFORM_LEAD_SOURCE_CREATED',
      'Lead source created',
    );
  }

  @Get('lead-sources')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listLeadSources(
    @Query('organizationId') organizationId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listLeadSources(organizationId),
      'EDUCATION_PLATFORM_LEAD_SOURCES_FETCHED',
      'Lead sources fetched',
    );
  }

  @Get('lead-sources/operations/export')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportLeadSources(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportLeadSources(organizationId),
      'EDUCATION_PLATFORM_LEAD_SOURCES_EXPORTED',
      'Lead sources exported',
    );
  }

  @Post('lead-stages')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createLeadStage(@Body() dto: CreateLeadStageDto) {
    return successResponse(
      await this.service.createLeadStage(dto),
      'EDUCATION_PLATFORM_LEAD_STAGE_CREATED',
      'Lead stage created',
    );
  }

  @Get('lead-stages')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listLeadStages(
    @Query('organizationId') organizationId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listLeadStages(organizationId),
      'EDUCATION_PLATFORM_LEAD_STAGES_FETCHED',
      'Lead stages fetched',
    );
  }

  @Get('lead-stages/operations/export')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportLeadStages(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportLeadStages(organizationId),
      'EDUCATION_PLATFORM_LEAD_STAGES_EXPORTED',
      'Lead stages exported',
    );
  }

  @Post('departments')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return successResponse(
      await this.service.createDepartment(dto),
      'EDUCATION_PLATFORM_DEPARTMENT_CREATED',
      'Department created',
    );
  }

  @Get('departments')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listDepartments(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listDepartments(query),
      'EDUCATION_PLATFORM_DEPARTMENTS_FETCHED',
      'Departments fetched',
    );
  }

  @Get('departments/operations/export')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportDepartments(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportDepartments(organizationId),
      'EDUCATION_PLATFORM_DEPARTMENTS_EXPORTED',
      'Departments exported',
    );
  }

  @Delete('departments/:id')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async archiveDepartment(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateDepartmentStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_DEPARTMENT_ARCHIVED',
      'Department archived',
    );
  }

  @Post('departments/:id/restore')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async restoreDepartment(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateDepartmentStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_DEPARTMENT_RESTORED',
      'Department restored',
    );
  }

  @Post('teams')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createTeam(@Body() dto: CreateTeamDto) {
    return successResponse(
      await this.service.createTeam(dto),
      'EDUCATION_PLATFORM_TEAM_CREATED',
      'Team created',
    );
  }

  @Get('teams')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listTeams(@Query() query: ListOrganizationStructureDto) {
    return successResponse(
      await this.service.listTeams(query),
      'EDUCATION_PLATFORM_TEAMS_FETCHED',
      'Teams fetched',
    );
  }

  @Get('teams/operations/export')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async exportTeams(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportTeams(organizationId),
      'EDUCATION_PLATFORM_TEAMS_EXPORTED',
      'Teams exported',
    );
  }

  @Delete('teams/:id')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async archiveTeam(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateTeamStatus(id, organizationId, 'inactive'),
      'EDUCATION_PLATFORM_TEAM_ARCHIVED',
      'Team archived',
    );
  }

  @Post('teams/:id/restore')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async restoreTeam(
    @Param('id') id: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.updateTeamStatus(id, organizationId, 'active'),
      'EDUCATION_PLATFORM_TEAM_RESTORED',
      'Team restored',
    );
  }

  @Post('organization-branding')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async upsertBranding(@Body() dto: UpsertOrganizationBrandingDto) {
    return successResponse(
      await this.service.upsertBranding(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_BRANDING_UPDATED',
      'Organization branding updated',
    );
  }

  @Get('organization-branding')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async getBranding(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.getBranding(organizationId),
      'EDUCATION_PLATFORM_ORGANIZATION_BRANDING_FETCHED',
      'Organization branding fetched',
    );
  }

  @Post('channel-settings')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async upsertChannelSetting(@Body() dto: UpsertChannelSettingDto) {
    return successResponse(
      await this.service.upsertChannelSetting(dto),
      'EDUCATION_PLATFORM_CHANNEL_SETTING_UPDATED',
      'Channel setting updated',
    );
  }

  @Get('channel-settings')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listChannelSettings(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.listChannelSettings(organizationId),
      'EDUCATION_PLATFORM_CHANNEL_SETTINGS_FETCHED',
      'Channel settings fetched',
    );
  }

  @Post('organization-users')
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async upsertOrganizationUser(@Body() dto: UpsertOrganizationUserDto) {
    return successResponse(
      await this.service.upsertOrganizationUser(dto),
      'EDUCATION_PLATFORM_ORGANIZATION_USER_UPDATED',
      'Organization user updated',
    );
  }

  @Post('organization-users/create')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ORGANIZATION_MANAGE)
  async createOrganizationUser(
    @Body() dto: CreateOrganizationUserDto,
    @Req() req: { user: { sub: string } },
  ) {
    return successResponse(
      await this.service.createOrganizationUser(dto, req.user.sub),
      'EDUCATION_PLATFORM_ORGANIZATION_USER_CREATED',
      'Organization user created',
    );
  }

  @Get('organization-users')
  @Permissions(Permission.ORGANIZATION_VIEW)
  async listOrganizationUsers(@Query() query: ListOrganizationUsersDto) {
    return successResponse(
      await this.service.listOrganizationUsers(query),
      'EDUCATION_PLATFORM_ORGANIZATION_USERS_FETCHED',
      'Organization users fetched',
    );
  }

  @Patch('organization-users/:userId/status')
  @Permissions(Permission.ORGANIZATION_MANAGE)
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
      'Organization user status updated',
    );
  }
}
