import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  CreateCrmDocumentDto,
  UpdateCrmDocumentDto,
  VerifyCrmDocumentDto,
} from '../dto/documents.dto';
import { CrmDocument, CrmDocumentDocument } from '../schemas/documents.schema';

type DocumentListOptions = {
  category?: string;
  entityId?: string;
  entityType?: string;
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  tenantId: string;
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(CrmDocument.name)
    private readonly documents: Model<CrmDocumentDocument>,
  ) {}

  createDocument(userId: string, dto: CreateCrmDocumentDto) {
    return this.documents.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      entityId: toRequiredObjectId(dto.entityId),
      size: dto.size ?? 0,
      uploadedBy: toRequiredObjectId(userId),
    });
  }

  async listDocuments(options: DocumentListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      tenantId: toTenantObjectId(options.tenantId),
      ...(options.category ? { category: options.category } : {}),
      ...(options.entityType ? { entityType: options.entityType } : {}),
      ...(options.entityId
        ? { entityId: toRequiredObjectId(options.entityId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mimeType: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.documents
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.documents.countDocuments(filter),
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

  async updateDocument(documentId: string, dto: UpdateCrmDocumentDto) {
    const update: Record<string, unknown> = { ...dto };
    delete update.tenantId;
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!document) throw new NotFoundException('CRM document not found');
    return document;
  }

  async archiveDocument(documentId: string, tenantId: string) {
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!document) throw new NotFoundException('CRM document not found');
    return document;
  }

  async verifyDocument(
    userId: string,
    documentId: string,
    dto: VerifyCrmDocumentDto,
  ) {
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        ocrResult: dto.ocrResult ?? {},
        status: dto.status,
        verification: dto.verification ?? {},
        verifiedAt: new Date(),
        verifiedBy: toRequiredObjectId(userId),
      },
      { new: true },
    );
    if (!document) throw new NotFoundException('CRM document not found');
    return document;
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'name',
      'status',
      'updatedAt',
      'verifiedAt',
    ]);
    return value && allowed.has(value) ? value : 'updatedAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
