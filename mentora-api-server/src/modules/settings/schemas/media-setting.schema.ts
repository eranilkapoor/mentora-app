import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { MediaQuality } from '../enums/settings-preferences.enums';

@Schema({ collection: COLLECTION_NAMES.MEDIA_SETTING, timestamps: true })
export class MediaSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) autoDownloadPhotos!: boolean;
  @Prop({ default: false }) videoAutoplay!: boolean;
  @Prop({
    type: String,
    enum: MediaQuality,
    default: MediaQuality.MEDIUM,
  })
  mediaQuality!: MediaQuality;
  @Prop({ default: false }) blurPrivatePhotos!: boolean;
  @Prop({ default: true }) showMediaInGallery!: boolean;
}

export type MediaSettingDocument = MediaSetting & Document;
export const MediaSettingSchema = SchemaFactory.createForClass(MediaSetting);
