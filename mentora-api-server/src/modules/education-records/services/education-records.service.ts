import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import {
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { EDUCATION_RECORD_MODULES } from '../education-records.constants';
import {
  EducationRecordDocument,
  createEducationRecordSchema,
} from '../education-records.factory';

@Injectable()
export class EducationRecordsService {
  private readonly services = new Map<
    string,
    CrmDomainRecordService<EducationRecordDocument>
  >();

  constructor(
    @InjectConnection() connection: Connection,
    auditService: AdminAuditService,
  ) {
    for (const module of EDUCATION_RECORD_MODULES) {
      const { modelName, schema } = createEducationRecordSchema(
        module.collection,
      );
      const model = (connection.models[modelName] ??
        connection.model(modelName, schema)) as Model<EducationRecordDocument>;
      this.services.set(
        module.resource,
        new CrmDomainRecordService<EducationRecordDocument>(
          model,
          auditService,
          module.resource,
        ),
      );
    }
  }

  create(resource: string, userId: string, dto: CreateCrmDomainRecordDto) {
    return this.get(resource).create(userId, dto);
  }

  list(
    resource: string,
    options: Parameters<
      CrmDomainRecordService<EducationRecordDocument>['list']
    >[0],
  ) {
    return this.get(resource).list(options);
  }

  exportRecords(resource: string, organizationId: string) {
    return this.get(resource).exportRecords(organizationId);
  }

  getById(resource: string, recordId: string, organizationId: string) {
    return this.get(resource).getById(recordId, organizationId);
  }

  bulkUpdateStatus(
    resource: string,
    userId: string,
    dto: BulkUpdateCrmDomainRecordStatusDto,
  ) {
    return this.get(resource).bulkUpdateStatus(userId, dto);
  }

  update(
    resource: string,
    userId: string,
    recordId: string,
    dto: UpdateCrmDomainRecordDto,
  ) {
    return this.get(resource).update(userId, recordId, dto);
  }

  archive(
    resource: string,
    userId: string,
    recordId: string,
    organizationId: string,
  ) {
    return this.get(resource).archive(userId, recordId, organizationId);
  }

  restore(
    resource: string,
    userId: string,
    recordId: string,
    organizationId: string,
  ) {
    return this.get(resource).restore(userId, recordId, organizationId);
  }

  complete(
    resource: string,
    userId: string,
    recordId: string,
    dto: CompleteCrmDomainRecordDto,
  ) {
    return this.get(resource).complete(userId, recordId, dto);
  }

  private get(resource: string) {
    const service = this.services.get(resource);
    if (!service) throw new NotFoundException('Education CRM module not found');
    return service;
  }
}
