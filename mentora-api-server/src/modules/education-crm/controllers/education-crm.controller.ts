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
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import {
  AddCrmLeadActivityDto,
  AssignCrmLeadDto,
  ChangeCrmLeadStageDto,
  CreateCrmApplicationDto,
  CreateCrmLeadDto,
  CreateCrmTaskDto,
  CreateCrmTenantDto,
} from '../dto/education-crm.dto';
import { EducationCrmService } from '../services/education-crm.service';

@Controller('education-crm')
export class EducationCrmController {
  constructor(private readonly service: EducationCrmService) {}

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

  @Get('dashboard')
  async dashboard(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.getDashboard(tenantId),
      'CRM_DASHBOARD_FETCHED',
      'CRM dashboard fetched',
    );
  }
}
