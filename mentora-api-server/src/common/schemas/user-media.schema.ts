import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { MediaType, MimeType } from '@/common/enums';
import {
  MediaModerationStatus,
  MediaStatus,
} from '@/common/enums/user-media.enums';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ collection: COLLECTION_NAMES.MEDIA, timestamps: true })
export class Media {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: MediaType, required: true, index: true })
  type!: MediaType;

  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: String })
  thumbnailUrl?: string;

  @Prop({ type: String })
  filename?: string;

  @Prop({ type: String, enum: MimeType })
  mimeType?: MimeType;

  @Prop({ type: Number })
  size?: number;

  @Prop({ type: String, enum: MediaStatus, default: MediaStatus.ACTIVE })
  status!: MediaStatus;

  @Prop({
    type: String,
    enum: MediaModerationStatus,
    default: MediaModerationStatus.APPROVED,
  })
  moderationStatus!: MediaModerationStatus;

  @Prop({ type: [String], default: [] })
  moderationReasons!: string[];

  @Prop({ type: Object, default: {} })
  moderationMetadata!: Record<string, unknown>;

  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: Date.now })
  uploadedAt!: Date;

  @Prop({ type: Date })
  anonymizedAt?: Date;

  @Prop({ type: String })
  retentionReason?: string;

  @Prop({ type: Date })
  legalHoldUntil?: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ type: 1 });
MediaSchema.index({ isPrimary: 1, isActive: 1 });
MediaSchema.index({ moderationStatus: 1, status: 1, createdAt: -1 });
MediaSchema.index({ moderationStatus: 1, isActive: 1, createdAt: 1 });
MediaSchema.index({ anonymizedAt: 1, retentionReason: 1 });
MediaSchema.index({ legalHoldUntil: 1 });
MediaSchema.index({ userId: 1, type: 1, status: 1, isActive: 1 });
