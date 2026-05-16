import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Media,
  MediaDocument,
  MediaStatus,
} from '../schemas/media/media.schema';
import { MediaType } from 'src/common/enums';

export interface CreateMediaInput {
  url: string;
  filename?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  size?: number;
  isPrimary: boolean;
  type: MediaType;
}

@Injectable()
export class MediaRepository {
  constructor(
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
  ) { }

  async create(userId: string, inputs: CreateMediaInput[]) {
    const docs = inputs.map((input) => ({
      ...input,
      userId: new Types.ObjectId(userId),
      status: MediaStatus.ACTIVE,
      isActive: true,
      uploadedAt: new Date(),
    }));
    return this.mediaModel.insertMany(docs);
  }

  async findAllByUser(userId: string, type: MediaType) {
    return this.mediaModel
      .find({
        userId: new Types.ObjectId(userId),
        type,
        status: MediaStatus.ACTIVE,
      },
        {
          _id: 0,
          __v: 0,
          uploadedAt: 0,
          createdAt: 0,
          updatedAt: 0
        }
      )
      .sort({ isPrimary: -1, uploadedAt: -1 })
      .lean();
  }

  async findById(mediaId: string) {
    return this.mediaModel.findById(mediaId).lean();
  }

  async setPrimary(userId: string, mediaId: string, type: MediaType) {
    // Unset all existing primary flags for this type
    await this.mediaModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        type,
        status: MediaStatus.ACTIVE,
      },
      { $set: { isPrimary: false } },
    );

    return this.mediaModel.findByIdAndUpdate(
      mediaId,
      { $set: { isPrimary: true } },
      { new: true },
    );
  }

  async softDelete(mediaId: string) {
    return this.mediaModel.findByIdAndUpdate(
      mediaId,
      { $set: { status: MediaStatus.DELETED, isActive: false } },
      { new: true },
    );
  }

  async countByUser(userId: string, type: MediaType) {
    return this.mediaModel.countDocuments({
      userId: new Types.ObjectId(userId),
      type,
      status: MediaStatus.ACTIVE,
    });
  }

  async hasPrimary(userId: string, type: MediaType) {
    const count = await this.mediaModel.countDocuments({
      userId: new Types.ObjectId(userId),
      type,
      isPrimary: true,
      status: MediaStatus.ACTIVE,
    });
    return count > 0;
  }
}
