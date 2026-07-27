import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      tenantId: new Types.ObjectId(dto.tenantId),
      entityId: new Types.ObjectId(dto.entityId),
    });
  }

  async listCommunications(tenantId: string) {
    return this.communications
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
