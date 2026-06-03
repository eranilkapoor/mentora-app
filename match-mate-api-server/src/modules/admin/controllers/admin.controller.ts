import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { BroadcastDto } from '../dto/broadcast.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { AdminAuditService } from '../services/admin-audit.service';
import { AdminAuditQueryDto } from '../dto/admin-audit-query.dto';
import { AnalyticsQueryDto } from '@/modules/analytics/dto/analytics-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE, Role.SUPPORT)
  async getDashboard(@Query() query: AnalyticsQueryDto) {
    return successResponse(
      await this.adminService.getDashboard(query),
      SuccessCode.ADMIN_DASHBOARD_FETCHED,
    );
  }

  @Get('audit-logs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async getAuditLogs(@Query() query: AdminAuditQueryDto) {
    return successResponse(
      await this.auditService.list(query),
      SuccessCode.ADMIN_AUDIT_LOGS_FETCHED,
    );
  }

  @Get('users')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.SUPPORT)
  async getUsers(@Query() query: AdminQueryDto) {
    return successResponse(
      await this.adminService.getUsers(query),
      SuccessCode.ADMIN_USERS_FETCHED,
    );
  }

  @Get('users/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.SUPPORT)
  async getUserById(@Param('userId') userId: string) {
    return successResponse(
      await this.adminService.getUserById(userId),
      SuccessCode.ADMIN_USER_FETCHED,
    );
  }

  @Patch('users/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR, Role.SUPPORT)
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return successResponse(
      await this.adminService.updateUserStatus(dto, req.user.sub, req),
      SuccessCode.ADMIN_USER_UPDATED,
    );
  }

  @Post('broadcast')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MARKETING_ADMIN)
  @HttpCode(HttpStatus.OK)
  broadcast(@Req() req: AuthenticatedRequest, @Body() dto: BroadcastDto) {
    return successResponse(
      this.adminService.broadcast(dto, req.user.sub, req),
      SuccessCode.ADMIN_BROADCAST_SENT,
    );
  }
}
