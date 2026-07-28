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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  CreateWorkflowRuleDto,
  ExecuteWorkflowDto,
  RetryWorkflowExecutionDto,
  UpdateWorkflowRuleDto,
} from '../dto/workflows.dto';
import { WorkflowsService } from '../services/workflows.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async createRule(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWorkflowRuleDto,
  ) {
    return successResponse(
      await this.service.createRule(req.user.sub, dto),
      'EDUCATION_PLATFORM_WORKFLOW_RULE_CREATED',
      'CRM workflow rule created',
    );
  }

  @Get('rules')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async listRules(
    @Query('tenantId') tenantId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('trigger') trigger?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listRules({
        limit,
        moduleKey,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        tenantId,
        trigger,
      }),
      'EDUCATION_PLATFORM_WORKFLOW_RULES_FETCHED',
      'CRM workflow rules fetched',
    );
  }

  @Put('rules/:ruleId')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateWorkflowRuleDto,
  ) {
    return successResponse(
      await this.service.updateRule(req.user.sub, ruleId, dto),
      'EDUCATION_PLATFORM_WORKFLOW_RULE_UPDATED',
      'CRM workflow rule updated',
    );
  }

  @Delete('rules/:ruleId')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async archiveRule(
    @Req() req: AuthenticatedRequest,
    @Param('ruleId') ruleId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.archiveRule(req.user.sub, ruleId, tenantId),
      'EDUCATION_PLATFORM_WORKFLOW_RULE_ARCHIVED',
      'CRM workflow rule archived',
    );
  }

  @Post('execute')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async execute(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return successResponse(
      await this.service.execute(req.user.sub, dto),
      'EDUCATION_PLATFORM_WORKFLOW_EXECUTED',
      'CRM workflow executed',
    );
  }

  @Get('executions')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async listExecutions(
    @Query('tenantId') tenantId: string,
    @Query('moduleKey') moduleKey?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('trigger') trigger?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listExecutions({
        limit,
        moduleKey,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        tenantId,
        trigger,
      }),
      'EDUCATION_PLATFORM_WORKFLOW_EXECUTIONS_FETCHED',
      'CRM workflow executions fetched',
    );
  }

  @Post('executions/:executionId/retry')
  @Permissions(Permission.CRM_WORKFLOW_MANAGE)
  async retryExecution(
    @Req() req: AuthenticatedRequest,
    @Param('executionId') executionId: string,
    @Body() dto: RetryWorkflowExecutionDto,
  ) {
    return successResponse(
      await this.service.retryExecution(req.user.sub, executionId, dto),
      'EDUCATION_PLATFORM_WORKFLOW_EXECUTION_RETRIED',
      'CRM workflow execution retried',
    );
  }
}
