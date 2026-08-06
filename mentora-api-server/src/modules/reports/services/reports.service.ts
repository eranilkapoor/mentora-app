import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CreateReportDefinitionDto,
  CreateReportExportJobDto,
  UpdateReportDefinitionDto,
} from '../dto/reports.dto';
import {
  ReportDefinition,
  ReportDefinitionDocument,
  ReportExportJob,
  ReportExportJobDocument,
} from '../schemas/reports.schema';

type ReportListOptions = {
  limit?: string;
  moduleKey?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(ReportDefinition.name)
    private readonly reportDefinitions: Model<ReportDefinitionDocument>,
    @InjectModel(ReportExportJob.name)
    private readonly reportExportJobs: Model<ReportExportJobDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  async createDefinition(userId: string, dto: CreateReportDefinitionDto) {
    const definition = await this.reportDefinitions.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      createdBy: toRequiredObjectId(userId),
    });
    await this.auditService.write({
      actorId: userId,
      action: 'report_definition.created',
      resource: 'report_definition',
      targetId: String(definition._id),
      after: this.toAuditRecord(definition.toObject()),
      metadata: {
        organizationId: dto.organizationId,
        moduleKey: dto.moduleKey,
      },
    });
    return definition;
  }

  async listDefinitions(options: ReportListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveDefinitionSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.moduleKey ? { moduleKey: options.moduleKey } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { moduleKey: { $regex: search, $options: 'i' } },
        { reportType: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.reportDefinitions
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reportDefinitions.countDocuments(filter),
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

  async updateDefinition(
    userId: string,
    definitionId: string,
    dto: UpdateReportDefinitionDto,
  ) {
    const update: Record<string, unknown> = { ...dto };
    delete update.organizationId;
    const definition = await this.reportDefinitions.findOneAndUpdate(
      {
        _id: toRequiredObjectId(definitionId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!definition)
      throw new NotFoundException('CRM report definition not found');
    await this.auditService.write({
      actorId: userId,
      action: 'report_definition.updated',
      resource: 'report_definition',
      targetId: String(definition._id),
      after: this.toAuditRecord(definition.toObject()),
      metadata: { organizationId: dto.organizationId },
    });
    return definition;
  }

  async archiveDefinition(
    userId: string,
    definitionId: string,
    organizationId: string,
  ) {
    const definition = await this.reportDefinitions.findOneAndUpdate(
      {
        _id: toRequiredObjectId(definitionId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!definition)
      throw new NotFoundException('CRM report definition not found');
    await this.auditService.write({
      actorId: userId,
      action: 'report_definition.archived',
      resource: 'report_definition',
      targetId: String(definition._id),
      after: this.toAuditRecord(definition.toObject()),
      metadata: { organizationId },
    });
    return definition;
  }

  async createExportJob(userId: string, dto: CreateReportExportJobDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const definition = await this.reportDefinitions
      .findOne({
        _id: toRequiredObjectId(dto.reportDefinitionId),
        organizationId,
      })
      .lean();

    if (!definition) {
      throw new NotFoundException('CRM report definition not found');
    }

    const job = await this.reportExportJobs.create({
      organizationId,
      reportDefinitionId: definition._id,
      format: dto.format ?? 'csv',
      status: 'completed',
      parameters: dto.parameters ?? {},
      result: {
        filename: `mentora-${definition.moduleKey}-report-${new Date()
          .toISOString()
          .slice(0, 10)}.${dto.format ?? 'csv'}`,
        rowsEstimated: 0,
        generatedAt: new Date().toISOString(),
      },
      requestedBy: toRequiredObjectId(userId),
      completedAt: new Date(),
    });

    await this.auditService.write({
      actorId: userId,
      action: 'report.exported',
      resource: 'report_export_job',
      targetId: String(job._id),
      after: this.toAuditRecord(job.toObject()),
      metadata: {
        organizationId: dto.organizationId,
        moduleKey: definition.moduleKey,
      },
    });

    return job;
  }

  async listExportJobs(options: ReportListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveExportSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.status ? { status: options.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.reportExportJobs
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reportExportJobs.countDocuments(filter),
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

  private resolveDefinitionSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'moduleKey',
      'name',
      'reportType',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private resolveExportSortBy(value?: string) {
    const allowed = new Set(['completedAt', 'createdAt', 'format', 'status']);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }
}
