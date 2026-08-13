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
  BulkMarkStudentAttendanceDto,
  CreateStudentAttendanceDto,
  UpdateStudentAttendanceDto,
} from '../dto/student-attendance.dto';
import { StudentAttendanceService } from '../services/student-attendance.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/attendance/students')
export class StudentAttendanceController {
  constructor(private readonly service: StudentAttendanceService) {}

  @Post()
  @Permissions(Permission.ATTENDANCE_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStudentAttendanceDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'STUDENT_ATTENDANCE_CREATED',
      'Student attendance recorded',
    );
  }

  @Post('bulk')
  @Permissions(Permission.ATTENDANCE_MANAGE)
  async bulkMark(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkMarkStudentAttendanceDto,
  ) {
    return successResponse(
      await this.service.bulkMark(req.user.sub, dto),
      'STUDENT_ATTENDANCE_BULK_MARKED',
      'Student attendance marked for the class',
    );
  }

  @Get()
  @Permissions(Permission.ATTENDANCE_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.list(
        {
          organizationId,
          studentId,
          subjectId,
          branchId,
          status,
          dateFrom,
          dateTo,
          page,
          limit,
          sortOrder,
        },
        req.user.sub,
      ),
      'STUDENT_ATTENDANCE_FETCHED',
      'Student attendance fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.ATTENDANCE_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'STUDENT_ATTENDANCE_EXPORTED',
      'Student attendance exported',
    );
  }

  @Get('summary/:studentId')
  @Permissions(Permission.ATTENDANCE_VIEW)
  async getSummary(
    @Param('studentId') studentId: string,
    @Query('organizationId') organizationId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return successResponse(
      await this.service.getSummary(
        organizationId,
        studentId,
        dateFrom,
        dateTo,
      ),
      'STUDENT_ATTENDANCE_SUMMARY_FETCHED',
      'Student attendance summary fetched',
    );
  }

  @Put(':attendanceId')
  @Permissions(Permission.ATTENDANCE_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('attendanceId') attendanceId: string,
    @Body() dto: UpdateStudentAttendanceDto,
  ) {
    return successResponse(
      await this.service.update(attendanceId, dto, req.user.sub),
      'STUDENT_ATTENDANCE_UPDATED',
      'Student attendance updated',
    );
  }
}
