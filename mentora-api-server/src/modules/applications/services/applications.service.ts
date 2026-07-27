import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  ApproveApplicationDto,
  CreateApplicationDto,
  UpdateApplicationReviewDto,
} from '../dto/applications.dto';
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

  async updateReview(applicationId: string, dto: UpdateApplicationReviewDto) {
    const application = await this.applications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(applicationId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.documentRequirements
          ? { documentRequirements: dto.documentRequirements }
          : {}),
        ...(dto.formResponses ? { formResponses: dto.formResponses } : {}),
        ...(dto.isLocked === undefined ? {} : { isLocked: dto.isLocked }),
        $push: {
          reviewHistory: {
            note: dto.note,
            status: dto.status,
            updatedAt: new Date(),
          },
        },
      },
      { new: true },
    );
    if (!application) throw new NotFoundException('CRM application not found');
    return application;
  }

  async decideApplication(applicationId: string, dto: ApproveApplicationDto) {
    const status =
      dto.decision === 'offer_issued'
        ? 'offer_issued'
        : dto.decision === 'approved'
          ? 'admission_confirmed'
          : 'rejected';
    const application = await this.applications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(applicationId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        approval: {
          decision: dto.decision,
          offer: dto.offer ?? {},
          reason: dto.reason,
          reviewedAt: new Date(),
        },
        isLocked: true,
        status,
        $push: {
          reviewHistory: {
            decision: dto.decision,
            note: dto.reason,
            status,
            updatedAt: new Date(),
          },
        },
      },
      { new: true },
    );
    if (!application) throw new NotFoundException('CRM application not found');
    return application;
  }
}
