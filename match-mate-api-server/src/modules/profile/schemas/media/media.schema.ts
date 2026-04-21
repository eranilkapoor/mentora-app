import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import { MediaType, MimeType } from 'src/common/enums';

@Schema({ collection: COLLECTIONS.MEDIA, timestamps: true })
export class Media {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ enum: MediaType })
  type!: MediaType;

  @Prop()
  filename?: string;

  @Prop({ required: true })
  url!: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ enum: Object.values(MimeType) })
  mimeType!: MimeType;

  @Prop()
  size?: number;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ default: true })
  isActive!: boolean;
}

export type MediaDocument = Media & Document;
export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.index({ type: 1 });
MediaSchema.index({ isPrimary: 1, isActive: 1 });
