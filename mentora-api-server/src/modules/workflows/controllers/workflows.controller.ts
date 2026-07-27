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
  ) {
    return successResponse(
      await this.service.listRules(tenantId, moduleKey),
      'EDUCATION_PLATFORM_WORKFLOW_RULES_FETCHED',
      'CRM workflow rules fetched',
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
  ) {
    return successResponse(
      await this.service.listExecutions(tenantId, moduleKey),
      'EDUCATION_PLATFORM_WORKFLOW_EXECUTIONS_FETCHED',
      'CRM workflow executions fetched',
    );
  }
}
