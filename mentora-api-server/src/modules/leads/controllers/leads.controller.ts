import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  AddLeadActivityDto,
  AddLeadAttachmentDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
  FindLeadDuplicatesDto,
  ImportLeadsDto,
  ListLeadAssignmentsDto,
  ListLeadsDto,
  MergeLeadsDto,
  ScoreLeadDto,
  TransferLeadDto,
  UpdateLeadDto,
  UpdateLeadTagsDto,
} from '../dto/leads.dto';
import { LeadsService } from '../services/leads.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/leads')
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
  async listLeads(@Query() query: ListLeadsDto): Promise<unknown> {
    return successResponse(
      await this.service.listLeads(query),
      'EDUCATION_PLATFORM_LEADS_FETCHED',
      'CRM leads fetched',
    );
  }

  @Put(':leadId')
  @Permissions(Permission.CRM_LEAD_UPDATE)
  async updateLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return successResponse(
      await this.service.updateLead(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_UPDATED',
      'CRM lead updated',
    );
  }

  @Delete(':leadId')
  @Permissions(Permission.CRM_LEAD_UPDATE)
  async archiveLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveLead(req.user.sub, leadId, organizationId),
      'EDUCATION_PLATFORM_LEAD_ARCHIVED',
      'CRM lead archived',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.CRM_LEAD_EXPORT)
  async exportLeads(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.exportLeads(req.user.sub, organizationId),
      'EDUCATION_PLATFORM_LEADS_EXPORTED',
      'CRM leads exported',
    );
  }

  @Get('operations/assignments')
  @Permissions(Permission.CRM_LEAD_VIEW)
  async listAssignments(@Query() query: ListLeadAssignmentsDto) {
    return successResponse(
      await this.service.listAssignments(query),
      'EDUCATION_PLATFORM_LEAD_ASSIGNMENTS_FETCHED',
      'CRM lead assignments fetched',
    );
  }

  @Get(':leadId')
  @Permissions(Permission.CRM_LEAD_VIEW)
  async getLead(
    @Query('organizationId') organizationId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.getLead(organizationId, leadId),
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

  @Post(':leadId/tags')
  @Permissions(Permission.CRM_LEAD_UPDATE)
  async updateTags(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: UpdateLeadTagsDto,
  ) {
    return successResponse(
      await this.service.updateTags(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_TAGS_UPDATED',
      'CRM lead tags updated',
    );
  }

  @Post(':leadId/attachments')
  @Permissions(Permission.CRM_LEAD_UPDATE)
  async addAttachment(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: AddLeadAttachmentDto,
  ) {
    return successResponse(
      await this.service.addAttachment(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_ATTACHMENT_ADDED',
      'CRM lead attachment added',
    );
  }

  @Post(':leadId/score')
  @Permissions(Permission.CRM_LEAD_UPDATE)
  async scoreLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: ScoreLeadDto,
  ) {
    return successResponse(
      await this.service.scoreLead(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_SCORED',
      'CRM lead score updated',
    );
  }

  @Post(':leadId/transfer')
  @Permissions(Permission.CRM_LEAD_ASSIGN)
  async transferLead(
    @Req() req: AuthenticatedRequest,
    @Param('leadId') leadId: string,
    @Body() dto: TransferLeadDto,
  ) {
    return successResponse(
      await this.service.transferLead(req.user.sub, leadId, dto),
      'EDUCATION_PLATFORM_LEAD_TRANSFERRED',
      'CRM lead transferred',
    );
  }

  @Get(':leadId/timeline')
  @Permissions(Permission.CRM_LEAD_VIEW)
  async listLeadTimeline(
    @Query('organizationId') organizationId: string,
    @Param('leadId') leadId: string,
  ) {
    return successResponse(
      await this.service.listLeadTimeline(organizationId, leadId),
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
}
