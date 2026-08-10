import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import {
  BulkUpdateDocumentStatusDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  VerifyDocumentDto,
} from '../dto/documents.dto';
import {
  DocumentRecord,
  DocumentRecordDocument,
} from '../schemas/documents.schema';

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
  organizationId: string;
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentRecord.name)
    private readonly documents: Model<DocumentRecordDocument>,
  ) {}

  createDocument(userId: string, dto: CreateDocumentDto) {
    return this.documents.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
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
      organizationId: toOrganizationObjectId(options.organizationId),
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

  async exportDocuments(organizationId: string) {
    const { items } = await this.listDocuments({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'category', 'mimeType', 'status', 'size'];
    return buildCsvExportFile(
      'documents',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async updateDocument(documentId: string, dto: UpdateDocumentDto) {
    const update: Record<string, unknown> = { ...dto };
    delete update.organizationId;
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!document) throw new NotFoundException('CRM document not found');
    return document;
  }

  async archiveDocument(documentId: string, organizationId: string) {
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!document) throw new NotFoundException('CRM document not found');
    return document;
  }

  async restoreDocument(documentId: string, organizationId: string) {
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'submitted' } },
      { new: true },
    );
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async bulkUpdateStatus(dto: BulkUpdateDocumentStatusDto) {
    const ids = dto.ids.map((id) => toRequiredObjectId(id));
    const result = await this.documents.updateMany(
      {
        _id: { $in: ids },
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: { status: dto.status } },
      { runValidators: true },
    );
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status: dto.status,
    };
  }

  async verifyDocument(
    userId: string,
    documentId: string,
    dto: VerifyDocumentDto,
  ) {
    const document = await this.documents.findOneAndUpdate(
      {
        _id: toRequiredObjectId(documentId),
        organizationId: toOrganizationObjectId(dto.organizationId),
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
