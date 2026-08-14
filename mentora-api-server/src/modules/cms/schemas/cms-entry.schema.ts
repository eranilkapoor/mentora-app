import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type CmsEntryDocument = HydratedDocument<CmsEntry>;

@Schema({ collection: COLLECTION_NAMES.CMS_ENTRY, timestamps: true })
export class CmsEntry {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ trim: true }) description?: string;
  @Prop({
    enum: [
      'draft',
      'open',
      'in_progress',
      'approved',
      'rejected',
      'completed',
      'archived',
    ],
    default: 'draft',
    index: true,
  })
  status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop({ index: true }) dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [], index: true }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ trim: true, lowercase: true, index: true })
  slug?: string;
  @Prop({ enum: ['page', 'blog', 'faq', 'banner', 'legal'], default: 'page' })
  contentType!: string;
  @Prop({ trim: true, default: 'en-IN' })
  locale!: string;
  @Prop({ enum: ['website', 'app', 'crm', 'all'], default: 'website' })
  channel!: string;
  @Prop({ trim: true })
  seoTitle?: string;
  @Prop({ trim: true })
  seoDescription?: string;
  @Prop()
  publishedAt?: Date;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const CmsEntrySchema = SchemaFactory.createForClass(CmsEntry);
CmsEntrySchema.index({ organizationId: 1, status: 1, dueAt: 1 });
CmsEntrySchema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
CmsEntrySchema.index({ organizationId: 1, createdAt: -1 });
CmsEntrySchema.index(
  { organizationId: 1, slug: 1, locale: 1 },
  { unique: true, sparse: true },
);
