import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { MediaType, MimeType } from '@/common/enums';
import {
  MediaModerationStatus,
  MediaStatus,
} from '../../enums/profile-media.enums';

@Schema({ collection: COLLECTION_NAMES.MEDIA, timestamps: true })
export class Media {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: MediaType, required: true })
  type!: MediaType;

  @Prop({ type: String })
  filename?: string;

  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: String })
  thumbnailUrl?: string;

  @Prop({ type: String, enum: Object.values(MimeType) })
  mimeType!: MimeType;

  @Prop({ type: Number })
  size?: number;

  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  // Lifecycle availability: processing, active, or deleted.
  @Prop({ type: String, enum: MediaStatus, default: MediaStatus.ACTIVE })
  status!: MediaStatus;

  // Trust/safety review state, independent from lifecycle availability.
  @Prop({
    type: String,
    enum: MediaModerationStatus,
    default: MediaModerationStatus.APPROVED,
    index: true,
  })
  moderationStatus!: MediaModerationStatus;

  @Prop({ type: [String], default: [] })
  moderationReasons!: string[];

  @Prop({ type: Object, default: {} })
  moderationMetadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  reviewNote?: string;

  // Fast visibility flag for read queries; historical metadata can remain.
  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;

  @Prop({ type: Date })
  uploadedAt!: Date;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ type: 1 });
MediaSchema.index({ isPrimary: 1, isActive: 1 });
MediaSchema.index({ moderationStatus: 1, status: 1, createdAt: -1 });
MediaSchema.index({ moderationStatus: 1, isActive: 1, createdAt: 1 });
MediaSchema.index({ anonymizedAt: 1, retentionReason: 1 });
MediaSchema.index({ legalHoldUntil: 1 });
MediaSchema.index({
  userId: 1,
  status: 1,
  isActive: 1,
  isPrimary: -1,
  uploadedAt: -1,
  createdAt: -1,
});
MediaSchema.index({
  userId: 1,
  type: 1,
  status: 1,
  moderationStatus: 1,
  isActive: 1,
  isPrimary: -1,
  uploadedAt: -1,
  createdAt: -1,
});
MediaSchema.index(
  { userId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isPrimary: true,
      isActive: true,
      status: MediaStatus.ACTIVE,
    },
  },
);
