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

  @Prop({ trim: true })
  color?: string;

  @Prop({
    enum: ['new', 'contacted', 'qualified', 'application', 'converted', 'lost'],
    default: 'new',
  })
  category!: string;

  @Prop({ default: false })
  isInitial!: boolean;

  @Prop({ default: false })
  isConverted!: boolean;

  @Prop({ default: false })
  isLost!: boolean;

  @Prop({ default: false })
  requiresRemarks!: boolean;

  @Prop({ type: [String], default: [] })
  mandatoryFieldsBeforeEntry!: string[];

  @Prop({ type: [Types.ObjectId], ref: 'LeadStage', default: [] })
  allowedNextStageIds!: Types.ObjectId[];

  @Prop({ default: 24 })
  slaDurationHours!: number;

  @Prop({ type: Object, default: {} })
  escalationRule!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  automationRules!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  visibilityRules!: Record<string, unknown>;

  @Prop({
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  archivedAt?: Date;
}

export const LeadStageSchema = SchemaFactory.createForClass(LeadStage);
LeadStageSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadStageSchema.index({ organizationId: 1, status: 1, order: 1, name: 1 });
LeadStageSchema.index({ organizationId: 1, category: 1, status: 1 });
