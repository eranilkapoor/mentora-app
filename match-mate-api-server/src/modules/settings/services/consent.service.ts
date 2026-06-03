import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecordConsentDto } from '../dto/consent.dto';
import {
  UserConsent,
  UserConsentDocument,
} from '../schemas/user-consent.schema';

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(UserConsent.name)
    private readonly consentModel: Model<UserConsentDocument>,
  ) {}

  getConsents(userId: string) {
    return this.consentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ acceptedAt: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  recordConsent(
    userId: string,
    dto: RecordConsentDto,
    request: { ip?: string; userAgent?: string },
  ) {
    const accepted = dto.accepted ?? true;
    const now = new Date();

    return this.consentModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          type: dto.type,
          version: dto.version,
        },
        {
          $set: {
            accepted,
            acceptedAt: now,
            revokedAt: accepted ? undefined : now,
            ip: request.ip,
            userAgent: request.userAgent,
            source: dto.source,
          },
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            type: dto.type,
            version: dto.version,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();
  }
}
