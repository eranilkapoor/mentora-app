import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  AddCrmLeadActivityDto,
  AssignCrmLeadDto,
  ChangeCrmLeadStageDto,
  CreateCrmBranchDto,
  CreateCrmCampaignDto,
  CreateCrmCommunicationDto,
  CreateCrmApplicationDto,
  CreateCrmLeadDto,
  CreateCrmLeadSourceDto,
  CreateCrmLeadStageDto,
  CreateCrmModuleRecordDto,
  CreateCrmTaskDto,
  CreateCrmTenantDto,
  PublicCrmLeadCaptureDto,
  SelectCrmContextDto,
  UpdateCrmModuleRecordDto,
  UpsertCrmUserMembershipDto,
} from '../dto/education-crm.dto';
import { EducationCrmService } from '../services/education-crm.service';

@UseGuards(JwtAuthGuard)
@Controller('education-crm')
export class EducationCrmController {
  constructor(private readonly service: EducationCrmService) {}

  @Public()
  @Post('public/leads')
  @HttpCode(HttpStatus.CREATED)
  async capturePublicLead(@Body() dto: PublicCrmLeadCaptureDto) {
    return successResponse(
      await this.service.capturePublicLead(dto),
      'CRM_PUBLIC_LEAD_CAPTURED',
      'CRM public lead captured',
    );
  }

  @Get('module-coverage')
  moduleCoverage() {
    return successResponse(
      this.service.getModuleCoverage(),
      'CRM_MODULE_COVERAGE_FETCHED',
      'CRM module coverage fetched',
    );
  }

  @Get('me/contexts')
  async myContexts(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.service.listUserContexts(req.user.sub),
      'CRM_CONTEXTS_FETCHED',
      'CRM contexts fetched',
    );
  }

  @Post('me/context')
  async selectContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SelectCrmContextDto,
  ) {
    return successResponse(
      await this.service.selectContext(req.user.sub, dto),
      'CRM_CONTEXT_SELECTED',
      'CRM context selected',
    );
  }

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() dto: CreateCrmTenantDto) {
    return successResponse(
      await this.service.createTenant(dto),
      'CRM_TENANT_CREATED',
      'CRM tenant created',
    );
  }

  @Get('tenants')
  async listTenants() {
    return successResponse(
      await this.service.listTenants(),
      'CRM_TENANTS_FETCHED',
      'CRM tenants fetched',
    );
  }

  @Post('memberships')
  @HttpCode(HttpStatus.CREATED)
  async upsertMembership(@Body() dto: UpsertCrmUserMembershipDto) {
    return successResponse(
      await this.service.upsertMembership(dto),
      'CRM_MEMBERSHIP_UPSERTED',
      'CRM membership upserted',
    );
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  async createBranch(@Body() dto: CreateCrmBranchDto) {
    return successResponse(
      await this.service.createBranch(dto),
      'CRM_BRANCH_CREATED',
      'CRM branch created',
    );
  }

  @Get('branches')
  async listBranches(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listBranches(tenantId),
      'CRM_BRANCHES_FETCHED',
      'CRM branches fetched',
    );
  }

  @Post('lead-sources')
  @HttpCode(HttpStatus.CREATED)
  async createLeadSource(@Body() dto: CreateCrmLeadSourceDto) {
    return successResponse(
      await this.service.createLeadSource(dto),
      'CRM_LEAD_SOURCE_CREATED',
      'CRM lead source created',
    );
  }

  @Get('lead-sources')
  async listLeadSources(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadSources(tenantId),
      'CRM_LEAD_SOURCES_FETCHED',
      'CRM lead sources fetched',
    );
  }

  @Post('lead-stages')
  @HttpCode(HttpStatus.CREATED)
  async createLeadStage(@Body() dto: CreateCrmLeadStageDto) {
    return successResponse(
      await this.service.createLeadStage(dto),
      'CRM_LEAD_STAGE_CREATED',
      'CRM lead stage created',
    );
  }

  @Get('lead-stages')
  async listLeadStages(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeadStages(tenantId),
      'CRM_LEAD_STAGES_FETCHED',
      'CRM lead stages fetched',
    );
  }

  @Post('leads')
  @HttpCode(HttpStatus.CREATED)
  async createLead(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmLeadDto,
  ) {
    return successResponse(
      await this.service.createLead(req.user.sub, dto),
      'CRM_LEAD_CREATED',
      'CRM lead created',
    );
  }

  @Get('leads')
  async listLeads(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeads(tenantId),
      'CRM_LEADS_FETCHED',
      'CRM leads fetched',
    );
  }

  @Get('leads/:leadId')
  async getLead(
    @Query('tenantId') tenantId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.getLead(tenantId, leadId),
      'CRM_LEAD_FETCHED',
      'CRM lead fetched',
    );
  }

  @Post('leads/:leadId/assign')
  async assignLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: AssignCrmLeadDto,
  ) {
    return successResponse(
      await this.service.assignLead(req.user.sub, leadId, dto),
      'CRM_LEAD_ASSIGNED',
      'CRM lead assigned',
    );
  }

  @Post('leads/:leadId/change-stage')
  async changeLeadStage(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: ChangeCrmLeadStageDto,
  ) {
    return successResponse(
      await this.service.changeLeadStage(req.user.sub, leadId, dto),
      'CRM_LEAD_STAGE_CHANGED',
      'CRM lead stage changed',
    );
  }

  @Post('leads/:leadId/activities')
  async addLeadActivity(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: AddCrmLeadActivityDto,
  ) {
    return successResponse(
      await this.service.addLeadActivity(req.user.sub, leadId, dto),
      'CRM_LEAD_ACTIVITY_CREATED',
      'CRM lead activity created',
    );
  }

  @Get('leads/:leadId/timeline')
  async listLeadTimeline(
    @Query('tenantId') tenantId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.listLeadTimeline(tenantId, leadId),
      'CRM_LEAD_TIMELINE_FETCHED',
      'CRM lead timeline fetched',
    );
  }

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() dto: CreateCrmApplicationDto) {
    return successResponse(
      await this.service.createApplication(dto),
      'CRM_APPLICATION_CREATED',
      'CRM application created',
    );
  }

  @Get('applications')
  async listApplications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listApplications(tenantId),
      'CRM_APPLICATIONS_FETCHED',
      'CRM applications fetched',
    );
  }

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmTaskDto,
  ) {
    return successResponse(
      await this.service.createTask(req.user.sub, dto),
      'CRM_TASK_CREATED',
      'CRM task created',
    );
  }

  @Get('tasks')
  async listTasks(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listTasks(tenantId),
      'CRM_TASKS_FETCHED',
      'CRM tasks fetched',
    );
  }

  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(@Body() dto: CreateCrmCampaignDto) {
    return successResponse(
      await this.service.createCampaign(dto),
      'CRM_CAMPAIGN_CREATED',
      'CRM campaign created',
    );
  }

  @Get('campaigns')
  async listCampaigns(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCampaigns(tenantId),
      'CRM_CAMPAIGNS_FETCHED',
      'CRM campaigns fetched',
    );
  }

  @Post('communications')
  @HttpCode(HttpStatus.CREATED)
  async createCommunication(@Body() dto: CreateCrmCommunicationDto) {
    return successResponse(
      await this.service.createCommunication(dto),
      'CRM_COMMUNICATION_CREATED',
      'CRM communication created',
    );
  }

  @Get('communications')
  async listCommunications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCommunications(tenantId),
      'CRM_COMMUNICATIONS_FETCHED',
      'CRM communications fetched',
    );
  }

  @Post('module-records')
  @HttpCode(HttpStatus.CREATED)
  async createModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmModuleRecordDto,
  ) {
    return successResponse(
      await this.service.createModuleRecord(req.user.sub, dto),
      'CRM_MODULE_RECORD_CREATED',
      'CRM module record created',
    );
  }

  @Get('module-records')
  async listModuleRecords(
    @Query('tenantId') tenantId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('status') status?: string,
  ) {
    return successResponse(
      await this.service.listModuleRecords(tenantId, moduleKey, status),
      'CRM_MODULE_RECORDS_FETCHED',
      'CRM module records fetched',
    );
  }

  @Post('module-records/:recordId')
  async updateModuleRecord(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmModuleRecordDto,
  ) {
    return successResponse(
      await this.service.updateModuleRecord(recordId, dto),
      'CRM_MODULE_RECORD_UPDATED',
      'CRM module record updated',
    );
  }

  @Get('dashboard')
  async dashboard(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getDashboard(tenantId),
      'CRM_DASHBOARD_FETCHED',
      'CRM dashboard fetched',
    );
  }
}
