import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  CreateReportDefinitionDto,
  CreateReportExportJobDto,
} from '../dto/reports.dto';
import { ReportsService } from '../services/reports.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_REPORT_VIEW)
  async createDefinition(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportDefinitionDto,
  ) {
    return successResponse(
      await this.service.createDefinition(req.user.sub, dto),
      'EDUCATION_PLATFORM_REPORT_DEFINITION_CREATED',
      'CRM report definition created',
    );
  }

  @Get('definitions')
  @Permissions(Permission.CRM_REPORT_VIEW)
  async listDefinitions(
    @Query('tenantId') tenantId: string,
    @Query('moduleKey') moduleKey?: string,
  ) {
    return successResponse(
      await this.service.listDefinitions(tenantId, moduleKey),
      'EDUCATION_PLATFORM_REPORT_DEFINITIONS_FETCHED',
      'CRM report definitions fetched',
    );
  }

  @Post('exports')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_REPORT_EXPORT)
  async createExportJob(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportExportJobDto,
  ) {
    return successResponse(
      await this.service.createExportJob(req.user.sub, dto),
      'EDUCATION_PLATFORM_REPORT_EXPORT_CREATED',
      'CRM report export created',
    );
  }

  @Get('exports')
  @Permissions(Permission.CRM_REPORT_EXPORT)
  async listExportJobs(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listExportJobs(tenantId),
      'EDUCATION_PLATFORM_REPORT_EXPORTS_FETCHED',
      'CRM report exports fetched',
    );
  }
}
