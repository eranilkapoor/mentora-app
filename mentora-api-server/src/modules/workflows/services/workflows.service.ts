import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CreateWorkflowRuleDto,
  ExecuteWorkflowDto,
  RetryWorkflowExecutionDto,
} from '../dto/workflows.dto';
import {
  WorkflowExecution,
  WorkflowExecutionDocument,
  WorkflowRule,
  WorkflowRuleDocument,
} from '../schemas/workflows.schema';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(WorkflowRule.name)
    private readonly workflowRules: Model<WorkflowRuleDocument>,
    @InjectModel(WorkflowExecution.name)
    private readonly workflowExecutions: Model<WorkflowExecutionDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  async createRule(userId: string, dto: CreateWorkflowRuleDto) {
    const rule = await this.workflowRules.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      createdBy: toRequiredObjectId(userId),
    });
    await this.auditService.write({
      actorId: userId,
      action: 'crm_workflow_rule.created',
      resource: 'crm_workflow_rule',
      targetId: String(rule._id),
      after: this.toAuditRecord(rule.toObject()),
      metadata: { tenantId: dto.tenantId, moduleKey: dto.moduleKey },
    });
    return rule;
  }

  async listRules(tenantId: string, moduleKey?: string) {
    return this.workflowRules
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(moduleKey ? { moduleKey } : {}),
      })
      .sort({ priority: -1, createdAt: -1 })
      .limit(100)
      .lean();
  }

  async execute(userId: string, dto: ExecuteWorkflowDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const rules = await this.workflowRules
      .find({
        tenantId,
        moduleKey: dto.moduleKey,
        trigger: dto.trigger,
        status: 'active',
      })
      .sort({ priority: -1, createdAt: 1 });

    if (rules.length === 0) {
      throw new NotFoundException('No active workflow rule found for trigger');
    }

    const executions = await Promise.all(
      rules.map((rule) =>
        this.workflowExecutions.create({
          tenantId,
          workflowRuleId: rule._id,
          moduleKey: dto.moduleKey,
          trigger: dto.trigger,
          targetId: dto.targetId,
          status: 'succeeded',
          input: dto.input ?? {},
          output: {
            actionsPlanned: rule.actions.length,
            actions: rule.actions,
          },
          executedAt: new Date(),
          executedBy: toRequiredObjectId(userId),
        }),
      ),
    );

    await this.auditService.write({
      actorId: userId,
      action: 'crm_workflow.executed',
      resource: 'crm_workflow',
      targetId: dto.targetId,
      after: { executions: executions.map((item) => String(item._id)) },
      metadata: {
        tenantId: dto.tenantId,
        moduleKey: dto.moduleKey,
        trigger: dto.trigger,
      },
    });

    return { matchedRules: rules.length, executions };
  }

  async listExecutions(tenantId: string, moduleKey?: string) {
    return this.workflowExecutions
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(moduleKey ? { moduleKey } : {}),
      })
      .sort({ executedAt: -1 })
      .limit(100)
      .lean();
  }

  async retryExecution(
    userId: string,
    executionId: string,
    dto: RetryWorkflowExecutionDto,
  ) {
    const execution = await this.workflowExecutions.findOne({
      _id: toRequiredObjectId(executionId),
      tenantId: toTenantObjectId(dto.tenantId),
    });
    if (!execution) throw new NotFoundException('Workflow execution not found');

    execution.set({
      attempt: execution.attempt + 1,
      error: undefined,
      input: {
        ...execution.input,
        retryReason: dto.reason,
      },
      nextRetryAt: undefined,
      status: 'succeeded',
    });
    await execution.save();
    await this.auditService.write({
      actorId: userId,
      action: 'crm_workflow_execution.retried',
      resource: 'crm_workflow_execution',
      targetId: String(execution._id),
      after: this.toAuditRecord(execution.toObject()),
      metadata: { tenantId: dto.tenantId },
    });
    return execution;
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }
}
