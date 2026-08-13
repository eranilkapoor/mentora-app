import {
  Body,
  Controller,
  Delete,
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
import { CreateTimetableDto, UpdateTimetableDto } from '../dto/timetable.dto';
import { TimetableService } from '../services/timetable.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/timetable')
export class TimetableController {
  constructor(private readonly service: TimetableService) {}

  @Post()
  @Permissions(Permission.SCHEDULE_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTimetableDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'TIMETABLE_SLOT_CREATED',
      'Timetable slot created',
    );
  }

  @Get()
  @Permissions(Permission.SCHEDULE_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('gradeId') gradeId?: string,
    @Query('staffUserId') staffUserId?: string,
    @Query('roomLabel') roomLabel?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('status') status?: string,
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
          staffUserId,
          roomLabel,
          dayOfWeek,
          status,
          page,
          limit,
        },
        req.user.sub,
      ),
      'TIMETABLE_FETCHED',
      'Timetable fetched',
    );
  }

  @Put(':timetableId')
  @Permissions(Permission.SCHEDULE_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Body() dto: UpdateTimetableDto,
  ) {
    return successResponse(
      await this.service.update(timetableId, dto, req.user.sub),
      'TIMETABLE_SLOT_UPDATED',
      'Timetable slot updated',
    );
  }

  @Delete(':timetableId')
  @Permissions(Permission.SCHEDULE_MANAGE)
  async cancel(
    @Req() req: AuthenticatedRequest,
    @Param('timetableId') timetableId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.cancel(timetableId, organizationId, req.user.sub),
      'TIMETABLE_SLOT_CANCELLED',
      'Timetable slot cancelled',
    );
  }
}
