import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type ServiceCatalogItemDocument = HydratedDocument<ServiceCatalogItem>;

@Schema({ collection: COLLECTION_NAMES.SERVICE_CATALOG_ITEM, timestamps: true })
export class ServiceCatalogItem {
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
  @Prop({ trim: true, uppercase: true, index: true })
  code?: string;
  @Prop({
    enum: ['ai_tutor', 'human_tutor', 'crm_seat', 'admission_service', 'addon'],
    default: 'addon',
    index: true,
  })
  category!: string;
  @Prop({ default: 0, min: 0 })
  price!: number;
  @Prop({ trim: true, default: 'INR' })
  currency!: string;
  @Prop({
    enum: ['one_time', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  })
  billingCycle!: string;
  @Prop({ default: false })
  isAddon!: boolean;
  @Prop({ type: [String], default: [] })
  enabledModules!: string[];
  @Prop({ type: Object, default: {} })
  usageLimits!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ServiceCatalogItemSchema =
  SchemaFactory.createForClass(ServiceCatalogItem);
ServiceCatalogItemSchema.index({ organizationId: 1, status: 1, dueAt: 1 });
ServiceCatalogItemSchema.index({
  organizationId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
ServiceCatalogItemSchema.index({ organizationId: 1, createdAt: -1 });
ServiceCatalogItemSchema.index(
  { organizationId: 1, code: 1 },
  { unique: true, sparse: true },
);
ServiceCatalogItemSchema.index({ organizationId: 1, category: 1, status: 1 });
