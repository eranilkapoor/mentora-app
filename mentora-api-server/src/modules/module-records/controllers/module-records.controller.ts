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
  CreateModuleRecordDto,
  UpdateModuleRecordDto,
} from '../dto/module-records.dto';
import { ModuleCoverageService } from '../services/module-coverage.service';
import { ModuleRecordsService } from '../services/module-records.service';

@UseGuards(JwtAuthGuard)
@Controller('module-records')
export class ModuleRecordsController {
  constructor(
    private readonly service: ModuleRecordsService,
    private readonly moduleCoverageService: ModuleCoverageService,
  ) {}

  @Get('coverage')
  moduleCoverage() {
    return successResponse(
      this.moduleCoverageService.getModuleCoverage(),
      'EDUCATION_PLATFORM_MODULE_COVERAGE_FETCHED',
      'Module coverage fetched',
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createModuleRecord(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.createModuleRecord(req.user.sub, dto),
      'EDUCATION_PLATFORM_MODULE_RECORD_CREATED',
      'CRM module record created',
    );
  }

  @Get()
  async listModuleRecords(
    @Query('tenantId') tenantId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('status') status?: string,
  ) {
    return successResponse(
      await this.service.listModuleRecords(tenantId, moduleKey, status),
      'EDUCATION_PLATFORM_MODULE_RECORDS_FETCHED',
      'CRM module records fetched',
    );
  }

  @Post(':recordId')
  async updateModuleRecord(
    @Param('recordId') recordId: string,
    @Body() dto: UpdateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.updateModuleRecord(recordId, dto),
      'EDUCATION_PLATFORM_MODULE_RECORD_UPDATED',
      'CRM module record updated',
    );
  }
}
