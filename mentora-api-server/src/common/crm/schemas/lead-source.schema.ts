import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type LeadSourceDocument = HydratedDocument<LeadSource>;

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
      'paid_advertisement',
      'organic',
      'referral',
      'partner',
      'walk_in',
      'call_center',
      'education_fair',
      'import',
      'social_media',
      'api',
      'other',
    ],
    default: 'website',
  })
  category!: string;

  @Prop({ type: Types.ObjectId, ref: 'LeadSource' })
  parentSourceId?: Types.ObjectId;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Object, default: {} })
  defaultAssignmentRule!: Record<string, unknown>;

  @Prop({ trim: true })
  defaultCampaign?: string;

  @Prop({ default: 0 })
  cost!: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const LeadSourceSchema = SchemaFactory.createForClass(LeadSource);
LeadSourceSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadSourceSchema.index({ organizationId: 1, status: 1, name: 1 });
