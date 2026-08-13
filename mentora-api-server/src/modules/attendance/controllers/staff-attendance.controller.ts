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
  CreateStaffAttendanceDto,
  UpdateStaffAttendanceDto,
} from '../dto/staff-attendance.dto';
import { StaffAttendanceService } from '../services/staff-attendance.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/attendance/staff')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post()
  @Permissions(Permission.ATTENDANCE_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStaffAttendanceDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'STAFF_ATTENDANCE_CREATED',
      'Staff attendance recorded',
    );
  }

  @Get()
  @Permissions(Permission.ATTENDANCE_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('userId') userId?: string,
    @Query('branchId') branchId?: string,
    @Query('departmentId') departmentId?: string,
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
          userId,
          branchId,
          departmentId,
          status,
          dateFrom,
          dateTo,
          page,
          limit,
          sortOrder,
        },
        req.user.sub,
      ),
      'STAFF_ATTENDANCE_FETCHED',
      'Staff attendance fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.ATTENDANCE_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'STAFF_ATTENDANCE_EXPORTED',
      'Staff attendance exported',
    );
  }

  @Put(':attendanceId')
  @Permissions(Permission.ATTENDANCE_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('attendanceId') attendanceId: string,
    @Body() dto: UpdateStaffAttendanceDto,
  ) {
    return successResponse(
      await this.service.update(attendanceId, dto, req.user.sub),
      'STAFF_ATTENDANCE_UPDATED',
      'Staff attendance updated',
    );
  }
}
