import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({
  collection: COLLECTION_NAMES.ACCESSIBILITY_SETTING,
  timestamps: true,
})
export class AccessibilitySetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['small', 'medium', 'large', 'extra_large'],
    default: 'medium',
  })
  fontSize!: string;

  @Prop({ default: false }) highContrastMode!: boolean;
  @Prop({ default: false }) reduceAnimations!: boolean;
  @Prop({ default: false }) screenReaderOptimized!: boolean;
  @Prop({ default: false }) boldText!: boolean;
}

export type AccessibilitySettingDocument = AccessibilitySetting & Document;
export const AccessibilitySettingSchema =
  SchemaFactory.createForClass(AccessibilitySetting);
