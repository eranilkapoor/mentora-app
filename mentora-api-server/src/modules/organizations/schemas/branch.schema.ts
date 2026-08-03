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

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
BranchSchema.index({ organizationId: 1, code: 1 }, { unique: true });
BranchSchema.index({ organizationId: 1, status: 1, name: 1 });
