import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

@Schema({ collection: COLLECTIONS.ACCESSIBILITY_SETTING, timestamps: true })
export class AccessibilitySettings {
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

export type AccessibilitySettingsDocument = AccessibilitySettings & Document;
export const AccessibilitySettingsSchema = SchemaFactory.createForClass(
  AccessibilitySettings,
);
