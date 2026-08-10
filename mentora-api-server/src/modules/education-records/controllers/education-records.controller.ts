import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import {
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { EducationRecordsService } from '../services/education-records.service';

type ListQuery = {
  organizationId: string;
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: string;
};

abstract class EducationRecordController {
  protected constructor(
    private readonly service: EducationRecordsService,
    private readonly resource: string,
    private readonly label: string,
  ) {}

  @Post()
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(this.resource, req.user.sub, dto),
      `${this.resource.toUpperCase()}_CREATED`,
      `${this.label} created`,
    );
  }

  @Get()
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async list(@Query() query: ListQuery) {
    return successResponse(
      await this.service.list(this.resource, query),
      `${this.resource.toUpperCase()}S_FETCHED`,
      `${this.label}s fetched`,
    );
  }

  @Get('operations/export')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(this.resource, organizationId),
      `${this.resource.toUpperCase()}S_EXPORTED`,
      `${this.label}s exported`,
    );
  }

  @Get(':recordId')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(this.resource, recordId, organizationId),
      `${this.resource.toUpperCase()}_FETCHED`,
      `${this.label} fetched`,
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateCrmDomainRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(this.resource, req.user.sub, dto),
      `${this.resource.toUpperCase()}S_BULK_STATUS_UPDATED`,
      `${this.label}s updated`,
    );
  }

  @Post(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(this.resource, req.user.sub, recordId, dto),
      `${this.resource.toUpperCase()}_UPDATED`,
      `${this.label} updated`,
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
      await this.service.archive(
        this.resource,
        req.user.sub,
        recordId,
        organizationId,
      ),
      `${this.resource.toUpperCase()}_ARCHIVED`,
      `${this.label} archived`,
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
      await this.service.restore(
        this.resource,
        req.user.sub,
        recordId,
        organizationId,
      ),
      `${this.resource.toUpperCase()}_RESTORED`,
      `${this.label} restored`,
    );
  }

  @Post(':recordId/complete')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: CompleteCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.complete(this.resource, req.user.sub, recordId, dto),
      `${this.resource.toUpperCase()}_COMPLETED`,
      `${this.label} completed`,
    );
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/students')
export class AdminStudentsController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'student', 'Student');
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/academic-sessions')
export class AcademicSessionsController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'academic_session', 'Academic session');
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/courses')
export class CoursesController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'course', 'Course');
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/specializations')
export class SpecializationsController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'specialization', 'Specialization');
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/enrollment')
export class EnrollmentController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'enrollment', 'Enrollment');
  }
}

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/fees')
export class FeesController extends EducationRecordController {
  constructor(service: EducationRecordsService) {
    super(service, 'fee_record', 'Fee record');
  }
}
