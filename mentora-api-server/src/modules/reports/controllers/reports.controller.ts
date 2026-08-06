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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateReportDefinitionDto,
  CreateReportExportJobDto,
  UpdateReportDefinitionDto,
} from '../dto/reports.dto';
import { ReportsService } from '../services/reports.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('definitions')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.REPORT_VIEW)
  async createDefinition(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportDefinitionDto,
  ) {
    return successResponse(
      await this.service.createDefinition(req.user.sub, dto),
      'EDUCATION_PLATFORM_REPORT_DEFINITION_CREATED',
      'Report definition created',
    );
  }

  @Get('definitions')
  @Permissions(Permission.REPORT_VIEW)
  async listDefinitions(
    @Query('organizationId') organizationId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listDefinitions({
        limit,
        moduleKey,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_REPORT_DEFINITIONS_FETCHED',
      'Report definitions fetched',
    );
  }

  @Put('definitions/:definitionId')
  @Permissions(Permission.REPORT_VIEW)
  async updateDefinition(
    @Req() req: AuthenticatedRequest,
    @Param('definitionId') definitionId: string,
    @Body() dto: UpdateReportDefinitionDto,
  ) {
    return successResponse(
      await this.service.updateDefinition(req.user.sub, definitionId, dto),
      'EDUCATION_PLATFORM_REPORT_DEFINITION_UPDATED',
      'Report definition updated',
    );
  }

  @Delete('definitions/:definitionId')
  @Permissions(Permission.REPORT_VIEW)
  async archiveDefinition(
    @Req() req: AuthenticatedRequest,
    @Param('definitionId') definitionId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveDefinition(
        req.user.sub,
        definitionId,
        organizationId,
      ),
      'EDUCATION_PLATFORM_REPORT_DEFINITION_ARCHIVED',
      'Report definition archived',
    );
  }

  @Post('exports')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.REPORT_EXPORT)
  async createExportJob(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReportExportJobDto,
  ) {
    return successResponse(
      await this.service.createExportJob(req.user.sub, dto),
      'EDUCATION_PLATFORM_REPORT_EXPORT_CREATED',
      'Report export created',
    );
  }

  @Get('exports')
  @Permissions(Permission.REPORT_EXPORT)
  async listExportJobs(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listExportJobs({
        limit,
        page,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_REPORT_EXPORTS_FETCHED',
      'Report exports fetched',
    );
  }
}
