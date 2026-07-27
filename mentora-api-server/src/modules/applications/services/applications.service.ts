import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toOptionalObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { CreateApplicationDto } from '../dto/applications.dto';
import {
  Application,
  ApplicationDocument,
} from '../schemas/applications.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applications: Model<ApplicationDocument>,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const count = await this.applications.countDocuments({
      tenantId,
    });
    return this.applications.create({
      ...dto,
      tenantId,
      leadId: toOptionalObjectId(dto.leadId),
      applicationNumber: `APP-${String(count + 1).padStart(6, '0')}`,
    });
  }

  async listApplications(tenantId: string) {
    return this.applications
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
