import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { RbacService } from '../services/rbac.service';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from 'src/common/enums';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';

@Controller('admin/rbac')
export class RbacController {
  constructor(private readonly service: RbacService) {}

  // ================= PERMISSIONS =================

  @Post('permissions')
  @Permissions(Permission.ADMIN_MANAGE)
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.service.createPermission(dto);
  }

  @Get('permissions')
  @Permissions(Permission.ADMIN_MANAGE)
  getPermissions() {
    return this.service.getPermissions();
  }

  @Delete('permissions/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  deletePermission(@Param('id') id: string) {
    return this.service.deletePermission(id);
  }

  // ================= ROLES =================
  @Post('roles')
  @Permissions(Permission.ADMIN_MANAGE)
  createRole(@Body() dto: CreateRoleDto) {
    return this.service.createRole(dto);
  }

  @Get('roles')
  @Permissions(Permission.ADMIN_MANAGE)
  getRoles() {
    return this.service.getRoles();
  }

  @Patch('roles/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  deleteRole(@Param('id') id: string) {
    return this.service.deleteRole(id);
  }

  // ================= USER ROLES =================
  @Post('users/:userId/roles')
  @Permissions(Permission.ADMIN_MANAGE)
  assignRoles(@Param('userId') userId: string, @Body() dto: AssignRolesDto) {
    return this.service.assignRoles(userId, dto.roleIds);
  }
}
