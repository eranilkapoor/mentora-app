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

  @Prop({ type: String, enum: MediaStatus, default: MediaStatus.ACTIVE })
  status!: MediaStatus;

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

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  uploadedAt!: Date;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ type: 1 });
MediaSchema.index({ isPrimary: 1, isActive: 1 });
MediaSchema.index({ moderationStatus: 1, status: 1, createdAt: -1 });
