import {
  Body,
  Controller,
  Delete,
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
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  BulkUpdateModuleRecordStatusDto,
  CreateModuleRecordDto,
  ExecuteModuleRecordDto,
  UpdateModuleRecordDto,
} from '../dto/module-records.dto';
import { ModuleCoverageService } from '../services/module-coverage.service';
import { ModuleRecordsService } from '../services/module-records.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/module-records')
export class ModuleRecordsController {
  constructor(
    private readonly service: ModuleRecordsService,
    private readonly moduleCoverageService: ModuleCoverageService,
  ) {}

  @Get('coverage')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  moduleCoverage() {
    return successResponse(
      this.moduleCoverageService.getModuleCoverage(),
      'EDUCATION_PLATFORM_MODULE_COVERAGE_FETCHED',
      'Module coverage fetched',
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async createModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.createModuleRecord(req.user.sub, dto),
      'EDUCATION_PLATFORM_MODULE_RECORD_CREATED',
      'Module record created',
    );
  }

  @Get()
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async listModuleRecords(
    @Query('organizationId') organizationId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.service.listModuleRecords({
        limit,
        moduleKey,
        page,
        priority,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_MODULE_RECORDS_FETCHED',
      'Module records fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.REPORT_EXPORT)
  async exportModuleRecords(
    @Query('organizationId') organizationId: string,
    @Query('moduleKey') moduleKey?: string,
  ) {
    return successResponse(
      await this.service.exportModuleRecords(organizationId, moduleKey),
      'EDUCATION_PLATFORM_MODULE_RECORDS_EXPORTED',
      'Module records exported',
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateModuleRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(req.user.sub, dto),
      'EDUCATION_PLATFORM_MODULE_RECORDS_BULK_STATUS_UPDATED',
      'Module records bulk status updated',
    );
  }

  @Get(':recordId')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async getModuleRecord(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getModuleRecord(recordId, organizationId),
      'EDUCATION_PLATFORM_MODULE_RECORD_FETCHED',
      'Module record fetched',
    );
  }

  @Delete(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async deleteModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.deleteModuleRecord(
        req.user.sub,
        recordId,
        organizationId,
      ),
      'EDUCATION_PLATFORM_MODULE_RECORD_ARCHIVED',
      'Module record archived',
    );
  }

  @Post(':recordId/restore')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async restoreModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restoreModuleRecord(
        req.user.sub,
        recordId,
        organizationId,
      ),
      'EDUCATION_PLATFORM_MODULE_RECORD_RESTORED',
      'Module record restored',
    );
  }

  @Post(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async updateModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.updateModuleRecord(req.user.sub, recordId, dto),
      'EDUCATION_PLATFORM_MODULE_RECORD_UPDATED',
      'Module record updated',
    );
  }

  @Post(':recordId/execute')
  @Permissions(Permission.WORKFLOW_MANAGE)
  async executeModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: ExecuteModuleRecordDto,
  ) {
    return successResponse(
      await this.service.executeModuleRecord(req.user.sub, recordId, dto),
      'EDUCATION_PLATFORM_MODULE_RECORD_EXECUTED',
      'Module record executed',
    );
  }
}
