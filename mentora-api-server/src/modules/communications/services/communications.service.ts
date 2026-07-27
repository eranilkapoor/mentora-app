import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { CreateCommunicationDto } from '../dto/communications.dto';
import {
  Communication,
  CommunicationDocument,
} from '../schemas/communications.schema';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectModel(Communication.name)
    private readonly communications: Model<CommunicationDocument>,
  ) {}

  async createCommunication(dto: CreateCommunicationDto) {
    return this.communications.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      entityId: toRequiredObjectId(dto.entityId),
    });
  }

  async listCommunications(tenantId: string) {
    return this.communications
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
