import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import { CreateTaskDto } from '../dto/tasks.dto';
import { TasksService } from '../services/tasks.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_TASK_MANAGE)
  async createTask(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTaskDto,
  ) {
    return successResponse(
      await this.service.createTask(req.user.sub, dto),
      'EDUCATION_PLATFORM_TASK_CREATED',
      'CRM task created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_TASK_VIEW)
  async listTasks(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listTasks(tenantId),
      'EDUCATION_PLATFORM_TASKS_FETCHED',
      'CRM tasks fetched',
    );
  }
}
