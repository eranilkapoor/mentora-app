import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.MEDIA_SETTING, timestamps: true })
export class MediaSetting {
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

export type MediaSettingDocument = MediaSetting & Document;
export const MediaSettingSchema = SchemaFactory.createForClass(MediaSetting);
