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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { successResponse } from '@/common/utils/response.util';
import { Permission } from '@/common/enums';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  AddLeadActivityDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
  FindLeadDuplicatesDto,
  ImportLeadsDto,
  MergeLeadsDto,
} from '../dto/leads.dto';
import { LeadsService } from '../services/leads.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_LEAD_CREATE)
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
  @Permissions(Permission.CRM_LEAD_VIEW)
  async listLeads(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listLeads(tenantId),
      'EDUCATION_PLATFORM_LEADS_FETCHED',
      'CRM leads fetched',
    );
  }

  @Get(':leadId')
  @Permissions(Permission.CRM_LEAD_VIEW)
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
  @Permissions(Permission.CRM_LEAD_ASSIGN)
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
  @Permissions(Permission.CRM_LEAD_UPDATE)
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
  @Permissions(Permission.CRM_LEAD_UPDATE)
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
  @Permissions(Permission.CRM_LEAD_VIEW)
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

  @Post('operations/duplicates')
  @Permissions(Permission.CRM_LEAD_VIEW)
  async findDuplicates(@Body() dto: FindLeadDuplicatesDto) {
    return successResponse(
      await this.service.findDuplicates(dto),
      'EDUCATION_PLATFORM_LEAD_DUPLICATES_FETCHED',
      'CRM lead duplicates fetched',
    );
  }

  @Post(':leadId/merge')
  @Permissions(Permission.CRM_LEAD_MERGE)
  async mergeLeads(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: MergeLeadsDto,
  ) {
    return successResponse(
      await this.service.mergeLeads(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEADS_MERGED',
      'CRM leads merged',
    );
  }

  @Post('operations/import')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_LEAD_IMPORT)
  async importLeads(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ImportLeadsDto,
  ) {
    return successResponse(
      await this.service.importLeads(req.user.sub, dto),
      'EDUCATION_PLATFORM_LEADS_IMPORTED',
      'CRM leads imported',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.CRM_LEAD_EXPORT)
  async exportLeads(
    @Req() req: AuthenticatedRequest,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.exportLeads(req.user.sub, tenantId),
      'EDUCATION_PLATFORM_LEADS_EXPORTED',
      'CRM leads exported',
    );
  }
}
