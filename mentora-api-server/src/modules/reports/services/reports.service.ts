import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CreateReportDefinitionDto,
  CreateReportExportJobDto,
} from '../dto/reports.dto';
import {
  ReportDefinition,
  ReportDefinitionDocument,
  ReportExportJob,
  ReportExportJobDocument,
} from '../schemas/reports.schema';

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
      tenantId: toTenantObjectId(dto.tenantId),
      createdBy: toRequiredObjectId(userId),
    });
    await this.auditService.write({
      actorId: userId,
      action: 'crm_report_definition.created',
      resource: 'crm_report_definition',
      targetId: String(definition._id),
      after: this.toAuditRecord(definition.toObject()),
      metadata: { tenantId: dto.tenantId, moduleKey: dto.moduleKey },
    });
    return definition;
  }

  async listDefinitions(tenantId: string, moduleKey?: string) {
    return this.reportDefinitions
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(moduleKey ? { moduleKey } : {}),
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async createExportJob(userId: string, dto: CreateReportExportJobDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const definition = await this.reportDefinitions
      .findOne({
        _id: toRequiredObjectId(dto.reportDefinitionId),
        tenantId,
      })
      .lean();

    if (!definition) {
      throw new NotFoundException('CRM report definition not found');
    }

    const job = await this.reportExportJobs.create({
      tenantId,
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
      action: 'crm_report.exported',
      resource: 'crm_report_export_job',
      targetId: String(job._id),
      after: this.toAuditRecord(job.toObject()),
      metadata: { tenantId: dto.tenantId, moduleKey: definition.moduleKey },
    });

    return job;
  }

  async listExportJobs(tenantId: string) {
    return this.reportExportJobs
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }
}
