import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { EDUCATION_PLATFORM_USER_ROLES } from '@/common/constants/education-platform.constants';
import { Organization } from '../../organizations/schemas/organization.schema';
import { Branch } from '../../organizations/schemas/branch.schema';
import { Department } from '../../organizations/schemas/department.schema';
import { Team } from '../../organizations/schemas/team.schema';

export type UserMembershipDocument = HydratedDocument<UserMembership>;

@Schema({
  collection: COLLECTION_NAMES.USER_MEMBERSHIP,
  timestamps: true,
})
export class UserMembership {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Branch.name, default: [] })
  branchIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Department.name, default: [] })
  departmentIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Team.name, default: [] })
  teamIds!: Types.ObjectId[];

  @Prop({ enum: EDUCATION_PLATFORM_USER_ROLES, required: true, index: true })
  role!: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ type: Types.ObjectId, ref: Branch.name, index: true })
  defaultBranchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  reportsToUserId?: Types.ObjectId;

  @Prop({
    enum: ['global', 'organization', 'branch', 'team'],
    default: 'organization',
  })
  accessLevel!: string;

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: string;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const UserMembershipSchema =
  SchemaFactory.createForClass(UserMembership);
UserMembershipSchema.index(
  { userId: 1, organizationId: 1, role: 1 },
  { unique: true },
);
UserMembershipSchema.index({ organizationId: 1, role: 1, status: 1 });
UserMembershipSchema.index({ organizationId: 1, role: 1, createdAt: -1 });
UserMembershipSchema.index({
  organizationId: 1,
  status: 1,
  role: 1,
  createdAt: -1,
});
UserMembershipSchema.index({ organizationId: 1, branchIds: 1, status: 1 });
UserMembershipSchema.index({ organizationId: 1, departmentIds: 1, status: 1 });
UserMembershipSchema.index({ organizationId: 1, teamIds: 1, status: 1 });
UserMembershipSchema.index({
  organizationId: 1,
  reportsToUserId: 1,
  status: 1,
});
UserMembershipSchema.index({ userId: 1, status: 1, lastAccessedAt: -1 });
