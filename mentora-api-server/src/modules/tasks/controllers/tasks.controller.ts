import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskWorkflowDto,
} from '../dto/tasks.dto';
import { TasksService } from '../services/tasks.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.TASK_MANAGE)
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
  @Permissions(Permission.TASK_VIEW)
  async listTasks(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listTasks({
        assignedTo,
        limit,
        page,
        priority,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_TASKS_FETCHED',
      'CRM tasks fetched',
    );
  }

  @Put(':taskId')
  @Permissions(Permission.TASK_MANAGE)
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return successResponse(
      await this.service.updateTask(taskId, dto),
      'EDUCATION_PLATFORM_TASK_UPDATED',
      'CRM task updated',
    );
  }

  @Delete(':taskId')
  @Permissions(Permission.TASK_MANAGE)
  async archiveTask(
    @Param('taskId') taskId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveTask(taskId, organizationId),
      'EDUCATION_PLATFORM_TASK_ARCHIVED',
      'CRM task archived',
    );
  }

  @Get('board')
  @Permissions(Permission.TASK_VIEW)
  async listTaskBoard(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.listTaskBoard(organizationId),
      'EDUCATION_PLATFORM_TASK_BOARD_FETCHED',
      'CRM task board fetched',
    );
  }

  @Post(':taskId/workflow')
  @Permissions(Permission.TASK_MANAGE)
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
