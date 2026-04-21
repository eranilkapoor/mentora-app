import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { BroadcastDto } from '../dto/broadcast.dto';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/status')
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateUser(@Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(dto);
  }

  @Patch('broadcast')
  @Roles(Role.ADMIN)
  broadcast(@Body() dto: BroadcastDto) {
    return this.adminService.broadcast(dto);
  }
}
