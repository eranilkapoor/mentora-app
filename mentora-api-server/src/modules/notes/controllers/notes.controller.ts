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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  BulkUpdateModuleRecordStatusDto,
  CreateModuleRecordDto,
  UpdateModuleRecordDto,
} from '@/modules/module-records/dto/module-records.dto';
import { ModuleRecordsService } from '@/modules/module-records/services/module-records.service';

const MODULE_KEY = 'notes';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/notes')
export class NotesController {
  constructor(private readonly service: ModuleRecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.createModuleRecord(req.user.sub, {
        ...dto,
        moduleKey: MODULE_KEY,
      }),
      'NOTE_CREATED',
      'Note created',
    );
  }

  @Get()
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async list(
    @Query('organizationId') organizationId: string,
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
        moduleKey: MODULE_KEY,
        page,
        priority,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'NOTES_FETCHED',
      'Notes fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.REPORT_EXPORT)
  async export(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportModuleRecords(organizationId, MODULE_KEY),
      'NOTES_EXPORTED',
      'Notes exported',
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateModuleRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(req.user.sub, {
        ...dto,
        moduleKey: MODULE_KEY,
      }),
      'NOTES_BULK_STATUS_UPDATED',
      'Notes bulk status updated',
    );
  }

  @Get(':recordId')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async get(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getModuleRecord(recordId, organizationId),
      'NOTE_FETCHED',
      'Note fetched',
    );
  }

  @Delete(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async archive(
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
      'NOTE_ARCHIVED',
      'Note archived',
    );
  }

  @Post(':recordId/restore')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async restore(
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
      'NOTE_RESTORED',
      'Note restored',
    );
  }

  @Post(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateModuleRecordDto,
  ) {
    return successResponse(
      await this.service.updateModuleRecord(req.user.sub, recordId, {
        ...dto,
        moduleKey: MODULE_KEY,
      }),
      'NOTE_UPDATED',
      'Note updated',
    );
  }
}
