import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  CreateCrmDocumentDto,
  VerifyCrmDocumentDto,
} from '../dto/documents.dto';
import { CrmDocument, CrmDocumentDocument } from '../schemas/documents.schema';

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

  listDocuments(tenantId: string, entityType?: string, entityId?: string) {
    return this.documents
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId: toRequiredObjectId(entityId) } : {}),
      })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
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
}
