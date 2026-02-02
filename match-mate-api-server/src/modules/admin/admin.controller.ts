import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminQueryDto } from './dto/admin-query.dto';
import { AdminRoles } from './decorators/admin.decorator';
import { AdminRole } from './enums/admin-role.enum';
import { AdminGuard } from './guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @AdminRoles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN, AdminRole.MODERATOR)
  getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/status')
  @AdminRoles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  updateUser(@Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(dto);
  }

  @Patch('broadcast')
  @AdminRoles(AdminRole.SUPER_ADMIN)
  broadcast(@Body() dto: any) {
    return this.adminService.broadcast(dto);
  }
}
