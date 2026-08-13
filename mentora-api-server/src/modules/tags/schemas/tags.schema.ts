import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ collection: COLLECTION_NAMES.TAG, timestamps: true })
export class Tag {
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
    default: 'open',
    index: true,
  })
  status!: string;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;
  @Prop({ trim: true, default: '#2563eb' }) color!: string;
  @Prop({
    enum: [
      'leads',
      'contacts',
      'applications',
      'students',
      'documents',
      'campaigns',
      'global',
    ],
    default: 'global',
    index: true,
  })
  module!: string;
  @Prop({
    enum: ['organization', 'branch', 'team', 'private'],
    default: 'organization',
  })
  scope!: string;
  @Prop({ type: Object, default: {} })
  usageRule!: Record<string, unknown>;
  @Prop({ default: 0 })
  usageCount!: number;
  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  relatedLeadId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Application', index: true })
  relatedApplicationId?: Types.ObjectId;
  @Prop() dueAt?: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [String], default: [], index: true }) tags!: string[];
  @Prop({ type: Object, default: {} }) payload!: Record<string, unknown>;
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
TagSchema.index({ organizationId: 1, title: 1 }, { unique: true });
TagSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
TagSchema.index({ organizationId: 1, module: 1, status: 1, title: 1 });
