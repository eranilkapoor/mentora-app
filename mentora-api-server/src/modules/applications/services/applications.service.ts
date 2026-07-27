import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    const count = await this.applications.countDocuments({
      tenantId: new Types.ObjectId(dto.tenantId),
    });
    return this.applications.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      leadId: dto.leadId ? new Types.ObjectId(dto.leadId) : undefined,
      applicationNumber: `APP-${String(count + 1).padStart(6, '0')}`,
    });
  }

  async listApplications(tenantId: string) {
    return this.applications
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
