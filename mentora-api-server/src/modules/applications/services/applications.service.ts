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
  UpdateApplicationDto,
  UpdateApplicationReviewDto,
} from '../dto/applications.dto';
import {
  Application,
  ApplicationDocument,
} from '../schemas/applications.schema';

type ApplicationListOptions = {
  courseOffering?: string;
  leadId?: string;
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  tenantId: string;
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applications: Model<ApplicationDocument>,
  ) {}

  async createApplication(dto: CreateApplicationDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.applications.create({
      ...dto,
      tenantId,
      leadId: toOptionalObjectId(dto.leadId),
      applicationNumber: `APP-${Date.now().toString(36).toUpperCase()}`,
    });
  }

  async listApplications(options: ApplicationListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      tenantId: toTenantObjectId(options.tenantId),
      ...(options.courseOffering
        ? { courseOffering: { $regex: options.courseOffering, $options: 'i' } }
        : {}),
      ...(options.leadId ? { leadId: toRequiredObjectId(options.leadId) } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { courseOffering: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.applications
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.applications.countDocuments(filter),
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

  async updateApplication(applicationId: string, dto: UpdateApplicationDto) {
    const update: Record<string, unknown> = { ...dto };
    delete update.tenantId;
    const application = await this.applications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(applicationId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!application) throw new NotFoundException('CRM application not found');
    return application;
  }

  async archiveApplication(applicationId: string, tenantId: string) {
    const application = await this.applications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(applicationId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'withdrawn', isLocked: true } },
      { new: true },
    );
    if (!application) throw new NotFoundException('CRM application not found');
    return application;
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

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'applicationNumber',
      'courseOffering',
      'createdAt',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
