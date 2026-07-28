import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Tenant } from '@/modules/tenants/schemas/tenants.schema';

export type ScholarshipApplicationDocument =
  HydratedDocument<ScholarshipApplication>;

@Schema({
  collection: COLLECTION_NAMES.SCHOLARSHIP_APPLICATION,
  timestamps: true,
})
export class ScholarshipApplication {
  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;
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
    default: 'open',
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
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [] }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}
export const ScholarshipApplicationSchema = SchemaFactory.createForClass(
  ScholarshipApplication,
);
ScholarshipApplicationSchema.index({ tenantId: 1, status: 1, dueAt: 1 });
ScholarshipApplicationSchema.index({ tenantId: 1, dueAt: 1, createdAt: -1 });
ScholarshipApplicationSchema.index({
  tenantId: 1,
  status: 1,
  dueAt: 1,
  createdAt: -1,
});
ScholarshipApplicationSchema.index({
  tenantId: 1,
  ownerId: 1,
  status: 1,
  dueAt: 1,
});
ScholarshipApplicationSchema.index({
  tenantId: 1,
  relatedLeadId: 1,
  createdAt: -1,
});
ScholarshipApplicationSchema.index({
  tenantId: 1,
  relatedApplicationId: 1,
  createdAt: -1,
});
