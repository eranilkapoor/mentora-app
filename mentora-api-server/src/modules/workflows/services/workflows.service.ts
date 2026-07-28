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
  UpdateWorkflowRuleDto,
} from '../dto/workflows.dto';
import {
  WorkflowExecution,
  WorkflowExecutionDocument,
  WorkflowRule,
  WorkflowRuleDocument,
} from '../schemas/workflows.schema';

type WorkflowListOptions = {
  limit?: string;
  moduleKey?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  tenantId: string;
  trigger?: string;
};

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

  async listRules(options: WorkflowListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveRuleSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter = this.buildWorkflowFilter(options);
    const [items, total] = await Promise.all([
      this.workflowRules
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.workflowRules.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async updateRule(userId: string, ruleId: string, dto: UpdateWorkflowRuleDto) {
    const update: Record<string, unknown> = { ...dto };
    delete update.tenantId;
    const rule = await this.workflowRules.findOneAndUpdate(
      {
        _id: toRequiredObjectId(ruleId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!rule) throw new NotFoundException('Workflow rule not found');
    await this.auditService.write({
      actorId: userId,
      action: 'crm_workflow_rule.updated',
      resource: 'crm_workflow_rule',
      targetId: String(rule._id),
      after: this.toAuditRecord(rule.toObject()),
      metadata: { tenantId: dto.tenantId, moduleKey: rule.moduleKey },
    });
    return rule;
  }

  async archiveRule(userId: string, ruleId: string, tenantId: string) {
    const rule = await this.workflowRules.findOneAndUpdate(
      {
        _id: toRequiredObjectId(ruleId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!rule) throw new NotFoundException('Workflow rule not found');
    await this.auditService.write({
      actorId: userId,
      action: 'crm_workflow_rule.archived',
      resource: 'crm_workflow_rule',
      targetId: String(rule._id),
      after: this.toAuditRecord(rule.toObject()),
      metadata: { tenantId, moduleKey: rule.moduleKey },
    });
    return rule;
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

  async listExecutions(options: WorkflowListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveExecutionSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter = this.buildWorkflowFilter(options);
    const [items, total] = await Promise.all([
      this.workflowExecutions
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.workflowExecutions.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
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

  private buildWorkflowFilter(options: WorkflowListOptions) {
    const filter: Record<string, unknown> = {
      tenantId: toTenantObjectId(options.tenantId),
      ...(options.moduleKey ? { moduleKey: options.moduleKey } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.trigger ? { trigger: options.trigger } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { moduleKey: { $regex: search, $options: 'i' } },
        { trigger: { $regex: search, $options: 'i' } },
      ];
    }
    return filter;
  }

  private resolveRuleSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'moduleKey',
      'name',
      'priority',
      'status',
      'trigger',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'priority';
  }

  private resolveExecutionSortBy(value?: string) {
    const allowed = new Set([
      'attempt',
      'createdAt',
      'executedAt',
      'moduleKey',
      'status',
      'trigger',
    ]);
    return value && allowed.has(value) ? value : 'executedAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
