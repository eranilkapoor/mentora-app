import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import {
  CreateAdminUserDto,
  ListAdminUsersDto,
  UpdateAdminUserDto,
} from '../dto/admin-iam.dto';
import { AdminIamService } from '../services/admin-iam.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminIamController {
  constructor(private readonly iamService: AdminIamService) {}

  @Get('users')
  @Permissions(Permission.USER_VIEW)
  async listUsers(
    @Query() query: ListAdminUsersDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<unknown> {
    return successResponse(
      await this.iamService.listUsers(query, req.user.sub),
      'ADMIN_USERS_FETCHED',
      'Admin users fetched',
    );
  }

  @Post('users')
  @Permissions(Permission.USER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateAdminUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<unknown> {
    return successResponse(
      await this.iamService.createUser(dto, req.user.sub),
      'ADMIN_USER_CREATED',
      'Admin user created',
    );
  }

  @Get('users/:id')
  @Permissions(Permission.USER_VIEW)
  async getUser(@Param('id') id: string): Promise<unknown> {
    return successResponse(
      await this.iamService.getUser(id),
      'ADMIN_USER_FETCHED',
      'Admin user fetched',
    );
  }

  @Patch('users/:id')
  @Permissions(Permission.USER_UPDATE)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<unknown> {
    return successResponse(
      await this.iamService.updateUser(id, dto, req.user.sub),
      'ADMIN_USER_UPDATED',
      'Admin user updated',
    );
  }

  @Post('users/:id/revoke-sessions')
  @Permissions(Permission.USER_UPDATE)
  async revokeSessions(@Param('id') id: string): Promise<unknown> {
    return successResponse(
      await this.iamService.revokeUserSessions(id),
      'ADMIN_USER_SESSIONS_REVOKED',
      'Admin user sessions revoked',
    );
  }

  @Get('auth/overview')
  @Permissions(Permission.USER_VIEW)
  async getAuthOverview(
    @Query('organizationId') organizationId?: string,
  ): Promise<unknown> {
    return successResponse(
      await this.iamService.getAuthOverview(organizationId),
      'ADMIN_AUTH_OVERVIEW_FETCHED',
      'Admin authentication overview fetched',
    );
  }
}
