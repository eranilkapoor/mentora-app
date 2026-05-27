import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.LOCALIZATION_SETTING, timestamps: true })
export class LocalizationSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: 'en' }) appLanguage!: string;
  @Prop({ type: [String], default: ['en'] }) preferredLanguages!: string[];
  @Prop({ default: 'IN' }) region!: string;
  @Prop({ default: 'Asia/Kolkata' }) timezone!: string;
  @Prop({
    type: String,
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    default: 'DD/MM/YYYY',
  })
  dateFormat!: string;
  @Prop({ default: 'INR' }) currency!: string;
}

export type LocalizationSettingDocument = LocalizationSetting & Document;
export const LocalizationSettingSchema =
  SchemaFactory.createForClass(LocalizationSetting);
