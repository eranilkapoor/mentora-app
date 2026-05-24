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
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('admin/rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─── Permissions ──────────────────────────────────────────────────────────

  @Post('permissions')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDto) {
    return successResponse(
      await this.rbacService.createPermission(dto),
      SuccessCode.ADMIN_PERMISSION_CREATED,
    );
  }

  @Get('permissions')
  @Permissions(Permission.ADMIN_MANAGE)
  async getPermissions(@Query('module') module?: string) {
    return successResponse(
      await this.rbacService.getPermissions(module),
      SuccessCode.ADMIN_PERMISSIONS_FETCHED,
    );
  }

  @Get('permissions/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  async getPermissionById(@Param('id') id: string) {
    return successResponse(
      await this.rbacService.getPermissionById(id),
      SuccessCode.ADMIN_PERMISSIONS_FETCHED,
    );
  }

  @Delete('permissions/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  async deletePermission(@Param('id') id: string) {
    return successResponse(
      await this.rbacService.deletePermission(id),
      SuccessCode.ADMIN_PERMISSION_DELETED,
    );
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  @Post('roles')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() dto: CreateRoleDto) {
    return successResponse(
      await this.rbacService.createRole(dto),
      SuccessCode.ADMIN_ROLE_CREATED,
    );
  }

  @Get('roles')
  @Permissions(Permission.ADMIN_MANAGE)
  async getRoles() {
    return successResponse(
      await this.rbacService.getRoles(),
      SuccessCode.ADMIN_ROLES_FETCHED,
    );
  }

  @Get('roles/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  async getRoleById(@Param('id') id: string) {
    return successResponse(
      await this.rbacService.getRoleById(id),
      SuccessCode.ADMIN_ROLES_FETCHED,
    );
  }

  @Patch('roles/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return successResponse(
      await this.rbacService.updateRole(id, dto),
      SuccessCode.ADMIN_ROLE_UPDATED,
    );
  }

  @Delete('roles/:id')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string) {
    return successResponse(
      await this.rbacService.deleteRole(id),
      SuccessCode.ADMIN_ROLE_DELETED,
    );
  }

  // ─── User Roles ───────────────────────────────────────────────────────────

  @Get('users/:userId/roles')
  @Permissions(Permission.ADMIN_MANAGE)
  async getUserRoles(@Param('userId') userId: string) {
    return successResponse(
      await this.rbacService.getUserRoles(userId),
      SuccessCode.ADMIN_USER_ROLES_FETCHED,
    );
  }

  @Post('users/:userId/roles')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('userId') userId: string,
    @Body() dto: AssignRolesDto,
  ) {
    return successResponse(
      await this.rbacService.assignRoles(userId, dto.roleIds),
      SuccessCode.ADMIN_USER_ROLES_UPDATED,
    );
  }

  @Delete('users/:userId/roles')
  @Permissions(Permission.ADMIN_MANAGE)
  @HttpCode(HttpStatus.OK)
  async revokeRoles(@Param('userId') userId: string) {
    return successResponse(
      await this.rbacService.revokeRoles(userId),
      SuccessCode.ADMIN_USER_ROLES_UPDATED,
    );
  }
}
