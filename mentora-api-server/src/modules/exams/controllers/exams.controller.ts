import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
  CreateExamDto,
  RecordExamResultsDto,
  UpdateExamDto,
} from '../dto/exam.dto';
import { ExamsService } from '../services/exams.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Post()
  @Permissions(Permission.EXAM_MANAGE)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateExamDto) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'EXAM_CREATED',
      'Exam scheduled',
    );
  }

  @Get()
  @Permissions(Permission.EXAM_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.service.list(
        {
          organizationId,
          branchId,
          subjectId,
          gradeId,
          status,
          dateFrom,
          dateTo,
          page,
          limit,
        },
        req.user.sub,
      ),
      'EXAMS_FETCHED',
      'Exams fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.EXAM_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'EXAMS_EXPORTED',
      'Exams exported',
    );
  }

  @Get(':examId')
  @Permissions(Permission.EXAM_VIEW)
  async getById(
    @Req() req: AuthenticatedRequest,
    @Param('examId') examId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(examId, organizationId, req.user.sub),
      'EXAM_FETCHED',
      'Exam fetched',
    );
  }

  @Put(':examId')
  @Permissions(Permission.EXAM_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('examId') examId: string,
    @Body() dto: UpdateExamDto,
  ) {
    return successResponse(
      await this.service.update(examId, dto, req.user.sub),
      'EXAM_UPDATED',
      'Exam updated',
    );
  }

  @Post(':examId/results')
  @Permissions(Permission.EXAM_MANAGE)
  async recordResults(
    @Req() req: AuthenticatedRequest,
    @Param('examId') examId: string,
    @Body() dto: RecordExamResultsDto,
  ) {
    return successResponse(
      await this.service.recordResults(examId, req.user.sub, dto, req.user.sub),
      'EXAM_RESULTS_RECORDED',
      'Exam results recorded',
    );
  }

  @Post(':examId/publish')
  @Permissions(Permission.EXAM_MANAGE)
  async publishResults(
    @Req() req: AuthenticatedRequest,
    @Param('examId') examId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.publishResults(examId, organizationId, req.user.sub),
      'EXAM_RESULTS_PUBLISHED',
      'Exam results published',
    );
  }
}
