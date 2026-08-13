import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';

export type BranchDocument = HydratedDocument<Branch>;

@Schema({
  collection: COLLECTION_NAMES.BRANCH,
  timestamps: true,
})
export class Branch {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  postalCode?: string;

  @Prop({ trim: true })
  addressLine1?: string;

  @Prop({ trim: true })
  addressLine2?: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  managerId?: Types.ObjectId;

  @Prop({ trim: true })
  timezone?: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;

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

  @Prop({ type: Types.ObjectId, ref: 'User' })
  archivedBy?: Types.ObjectId;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
BranchSchema.index({ organizationId: 1, code: 1 }, { unique: true });
BranchSchema.index({ organizationId: 1, status: 1, name: 1 });
BranchSchema.index({ organizationId: 1, city: 1, status: 1 });
