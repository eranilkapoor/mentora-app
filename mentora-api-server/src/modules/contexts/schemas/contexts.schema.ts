import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';
import { Branch, Tenant } from '../../tenants/schemas/tenants.schema';

export type UserMembershipDocument = HydratedDocument<UserMembership>;

@Schema({
  collection: COLLECTION_NAMES.USER_MEMBERSHIP,
  timestamps: true,
})
export class UserMembership {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Tenant.name, required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Branch.name, default: [] })
  branchIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  departmentIds!: string[];

  @Prop({ enum: EDUCATION_PLATFORM_USER_ROLES, required: true, index: true })
  role!: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const UserMembershipSchema =
  SchemaFactory.createForClass(UserMembership);
UserMembershipSchema.index(
  { userId: 1, tenantId: 1, role: 1 },
  { unique: true },
);
UserMembershipSchema.index({ tenantId: 1, role: 1, status: 1 });
