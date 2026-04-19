import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AnalyticsEventType,
  AnalyticsFunnelStage,
  AnalyticsPlatform,
} from '../enums/analytics-event.enum';

@Schema({ timestamps: true })
export class AnalyticsEvent extends Document {
  @Prop()
  userId?: string;

  @Prop({ enum: AnalyticsEventType, required: true })
  eventType!: AnalyticsEventType;

  @Prop()
  sessionId?: string;

  @Prop()
  deviceId?: string;

  @Prop()
  profileId?: string;

  @Prop()
  targetUserId?: string;

  @Prop()
  matchId?: string;

  @Prop()
  chatId?: string;

  @Prop({ enum: AnalyticsFunnelStage })
  funnelStage?: AnalyticsFunnelStage;

  @Prop()
  source?: string;

  @Prop()
  medium?: string;

  @Prop()
  campaign?: string;

  @Prop()
  screen?: string;

  @Prop()
  country?: string;

  @Prop()
  state?: string;

  @Prop()
  city?: string;

  @Prop({ default: false })
  isPremium!: boolean;

  @Prop()
  success?: boolean;

  @Prop({ min: 0 })
  durationMs?: number;

  @Prop()
  value?: number;

  @Prop()
  appVersion?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: Date.now })
  occurredAt!: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ enum: AnalyticsPlatform, default: AnalyticsPlatform.WEB })
  platform!: AnalyticsPlatform;
}

export const AnalyticsEventSchema =
  SchemaFactory.createForClass(AnalyticsEvent);

AnalyticsEventSchema.index({ eventType: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ userId: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ platform: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ source: 1, campaign: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ funnelStage: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
