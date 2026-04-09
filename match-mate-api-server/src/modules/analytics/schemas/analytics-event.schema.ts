import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AnalyticsEventType } from '../enums/analytics-event.enum';

@Schema({ timestamps: true })
export class AnalyticsEvent extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ enum: AnalyticsEventType, required: true })
  eventType!: AnalyticsEventType;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: 'web' })
  platform!: 'web' | 'android' | 'ios';
}

export const AnalyticsEventSchema =
  SchemaFactory.createForClass(AnalyticsEvent);

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1 });
