import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({
  collection: COLLECTION_NAMES.ANALYTICS_DAILY_SUMMARY,
  timestamps: true,
})
export class AnalyticsDailySummary extends Document {
  @Prop({ required: true, unique: true, index: true })
  day!: string;

  @Prop({ index: true })
  organizationId?: string;

  @Prop({ index: true })
  branchId?: string;

  @Prop({ type: Date, required: true })
  from!: Date;

  @Prop({ type: Date, required: true })
  to!: Date;

  @Prop({ type: Object, default: {} })
  overview!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  funnel!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  revenue!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  learning!: Record<string, unknown>;

  @Prop({ type: Date, default: Date.now })
  generatedAt!: Date;
}

export const AnalyticsDailySummarySchema = SchemaFactory.createForClass(
  AnalyticsDailySummary,
);

AnalyticsDailySummarySchema.index({ generatedAt: -1 });
AnalyticsDailySummarySchema.index({ organizationId: 1, day: 1 });
