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
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  AddLeadActivityDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
} from '../dto/leads.dto';
import { LeadsService } from '../services/leads.service';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLead(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateLeadDto,
  ) {
    return successResponse(
      await this.service.createLead(req.user.sub, dto),
      'EDUCATION_PLATFORM_LEAD_CREATED',
      'CRM lead created',
    );
  }

  @Get()
  async listLeads(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeads(tenantId),
      'EDUCATION_PLATFORM_LEADS_FETCHED',
      'CRM leads fetched',
    );
  }

  @Get(':leadId')
  async getLead(
    @Query('tenantId') tenantId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.getLead(tenantId, leadId),
      'EDUCATION_PLATFORM_LEAD_FETCHED',
      'CRM lead fetched',
    );
  }

  @Post(':leadId/assign')
  async assignLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: AssignLeadDto,
  ) {
    return successResponse(
      await this.service.assignLead(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_ASSIGNED',
      'CRM lead assigned',
    );
  }

  @Post(':leadId/change-stage')
  async changeLeadStage(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: ChangeLeadStageDto,
  ) {
    return successResponse(
      await this.service.changeLeadStage(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_STAGE_CHANGED',
      'CRM lead stage changed',
    );
  }

  @Post(':leadId/activities')
  async addLeadActivity(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: AddLeadActivityDto,
  ) {
    return successResponse(
      await this.service.addLeadActivity(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_ACTIVITY_CREATED',
      'CRM lead activity created',
    );
  }

  @Get(':leadId/timeline')
  async listLeadTimeline(
    @Query('tenantId') tenantId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.listLeadTimeline(tenantId, leadId),
      'EDUCATION_PLATFORM_LEAD_TIMELINE_FETCHED',
      'CRM lead timeline fetched',
    );
  }
}
