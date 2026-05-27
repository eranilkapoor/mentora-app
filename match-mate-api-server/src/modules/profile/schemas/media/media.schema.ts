import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { MediaType, MimeType } from 'src/common/enums';

export enum MediaStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  PROCESSING = 'processing',
}

@Schema({ collection: COLLECTIONS.MEDIA, timestamps: true })
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

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date })
  uploadedAt!: Date;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ type: 1 });
MediaSchema.index({ isPrimary: 1, isActive: 1 });
