import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RbacService } from '../services/rbac.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';
import { Permission } from 'src/common/enums';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';

@Controller('admin/rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─── Permissions ──────────────────────────────────────────────────────────

  @Post('permissions')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  // @Permissions(Permission.ADMIN_MANAGE)
  getPermissions(@Query('module') module?: string) {
    return this.rbacService.getPermissions(module);
  }

  @Get('permissions/:id')
  // @Permissions(Permission.ADMIN_MANAGE)
  getPermissionById(@Param('id') id: string) {
    return this.rbacService.getPermissionById(id);
  }

  @Delete('permissions/:id')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  deletePermission(@Param('id') id: string) {
    return this.rbacService.deletePermission(id);
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  @Post('roles')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles')
  // @Permissions(Permission.ADMIN_MANAGE)
  getRoles() {
    return this.rbacService.getRoles();
  }

  @Get('roles/:id')
  // @Permissions(Permission.ADMIN_MANAGE)
  getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  @Patch('roles/:id')
  // @Permissions(Permission.ADMIN_MANAGE)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // ─── User Roles ───────────────────────────────────────────────────────────

  @Get('users/:userId/roles')
  // @Permissions(Permission.ADMIN_MANAGE)
  getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Post('users/:userId/roles')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  assignRoles(@Param('userId') userId: string, @Body() dto: AssignRolesDto) {
    return this.rbacService.assignRoles(userId, dto.roleIds);
  }

  @Delete('users/:userId/roles')
  // @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  revokeRoles(@Param('userId') userId: string) {
    return this.rbacService.revokeRoles(userId);
  }
}
