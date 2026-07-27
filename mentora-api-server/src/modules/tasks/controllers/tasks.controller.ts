import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateTaskDto, UpdateTaskWorkflowDto } from '../dto/tasks.dto';
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

  @Get('board')
  @Permissions(Permission.CRM_TASK_VIEW)
  async listTaskBoard(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listTaskBoard(tenantId),
      'EDUCATION_PLATFORM_TASK_BOARD_FETCHED',
      'CRM task board fetched',
    );
  }

  @Post(':taskId([a-fA-F0-9]{24})/workflow')
  @Permissions(Permission.CRM_TASK_MANAGE)
  async updateWorkflow(
    @Req() req: AuthenticatedRequest,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskWorkflowDto,
  ) {
    return successResponse(
      await this.service.updateWorkflow(req.user.sub, taskId, dto),
      'EDUCATION_PLATFORM_TASK_WORKFLOW_UPDATED',
      'CRM task workflow updated',
    );
  }
}
