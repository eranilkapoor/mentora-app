import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from './organization.schema';
import { Branch } from './branch.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({
  collection: COLLECTION_NAMES.DEPARTMENT,
  timestamps: true,
})
export class Department {
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

  @Prop({ type: Types.ObjectId, ref: Branch.name, index: true })
  branchId?: Types.ObjectId;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  headId?: Types.ObjectId;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({
    enum: [
      'admissions',
      'sales',
      'marketing',
      'finance',
      'academics',
      'operations',
    ],
    default: 'admissions',
  })
  function!: string;

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

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.index({ organizationId: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ organizationId: 1, status: 1, name: 1 });
DepartmentSchema.index({ organizationId: 1, branchId: 1, status: 1, name: 1 });
