import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { BroadcastDto } from '../dto/broadcast.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getUsers(@Query() query: AdminQueryDto) {
    return successResponse(
      await this.adminService.getUsers(query),
      SuccessCode.ADMIN_USERS_FETCHED,
    );
  }

  @Get('users/:userId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getUserById(@Param('userId') userId: string) {
    return successResponse(
      await this.adminService.getUserById(userId),
      SuccessCode.ADMIN_USER_FETCHED,
    );
  }

  @Patch('users/status')
  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(@Body() dto: UpdateUserStatusDto) {
    return successResponse(
      await this.adminService.updateUserStatus(dto),
      SuccessCode.ADMIN_USER_UPDATED,
    );
  }

  @Post('broadcast')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  broadcast(@Body() dto: BroadcastDto) {
    return successResponse(
      this.adminService.broadcast(dto),
      SuccessCode.ADMIN_BROADCAST_SENT,
    );
  }
}
