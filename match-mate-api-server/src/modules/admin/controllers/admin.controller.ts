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

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:userId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/status')
  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(HttpStatus.OK)
  updateUserStatus(@Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(dto);
  }

  @Post('broadcast')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  broadcast(@Body() dto: BroadcastDto) {
    return this.adminService.broadcast(dto);
  }
}
