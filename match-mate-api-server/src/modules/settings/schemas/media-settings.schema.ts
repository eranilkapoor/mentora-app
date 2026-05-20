import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.MEDIA_SETTINGS, timestamps: true })
export class MediaSettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) autoDownloadPhotos!: boolean;
  @Prop({ default: false }) videoAutoplay!: boolean;
  @Prop({
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  mediaQuality!: string;
  @Prop({ default: false }) blurPrivatePhotos!: boolean;
  @Prop({ default: true }) showMediaInGallery!: boolean;
}

export type MediaSettingsDocument = MediaSettings & Document;
export const MediaSettingsSchema = SchemaFactory.createForClass(MediaSettings);
