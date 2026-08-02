import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type LeadSourceDocument = HydratedDocument<LeadSource>;
export type LeadStageDocument = HydratedDocument<LeadStage>;

@Schema({
  collection: COLLECTION_NAMES.LEAD_SOURCE,
  timestamps: true,
})
export class LeadSource {
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

  @Prop({
    enum: [
      'website',
      'landing_page',
      'facebook',
      'google',
      'whatsapp',
      'offline',
      'walk_in',
      'referral',
      'import',
      'partner',
      'api',
    ],
    default: 'website',
  })
  category!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const LeadSourceSchema = SchemaFactory.createForClass(LeadSource);
LeadSourceSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadSourceSchema.index({ organizationId: 1, status: 1, name: 1 });

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
