import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type LeadStageDocument = HydratedDocument<LeadStage>;

@Schema({
  collection: COLLECTION_NAMES.LEAD_STAGE,
  timestamps: true,
})
export class LeadStage {
  @Prop({
    type: Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: false })
  isInitial!: boolean;

  @Prop({ default: false })
  isConverted!: boolean;

  @Prop({ default: false })
  isLost!: boolean;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const LeadStageSchema = SchemaFactory.createForClass(LeadStage);
LeadStageSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadStageSchema.index({ organizationId: 1, status: 1, order: 1, name: 1 });
