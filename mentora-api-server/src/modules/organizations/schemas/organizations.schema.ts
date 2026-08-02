import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type OrganizationDocument = HydratedDocument<Organization>;
export type BranchDocument = HydratedDocument<Branch>;
export type DepartmentDocument = HydratedDocument<Department>;
export type TeamDocument = HydratedDocument<Team>;
export type OrganizationBrandingDocument =
  HydratedDocument<OrganizationBranding>;
export type ChannelSettingDocument = HydratedDocument<ChannelSetting>;
export type LeadSourceDocument = HydratedDocument<LeadSource>;
export type LeadStageDocument = HydratedDocument<LeadStage>;

@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION,
  timestamps: true,
})
export class Organization {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  code!: string;

  @Prop({
    enum: [
      'university',
      'college',
      'school',
      'coaching',
      'edtech',
      'study_abroad',
      'training',
    ],
    default: 'coaching',
  })
  type!: string;

  @Prop({
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ trim: true })
  primaryDomain?: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop({ default: 'INR' })
  currency!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ status: 1, name: 1 });

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

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.index({ organizationId: 1, code: 1 }, { unique: true });
DepartmentSchema.index({ organizationId: 1, status: 1, name: 1 });
DepartmentSchema.index({ organizationId: 1, branchId: 1, status: 1, name: 1 });
@Schema({
  collection: COLLECTION_NAMES.TEAM,
  timestamps: true,
})
export class Team {
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

  @Prop({ type: Types.ObjectId, ref: Department.name, index: true })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  managerId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  memberIds!: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  capacityRules!: Record<string, unknown>;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
TeamSchema.index({ organizationId: 1, code: 1 }, { unique: true });
TeamSchema.index({ organizationId: 1, departmentId: 1, status: 1 });
TeamSchema.index({ organizationId: 1, status: 1, name: 1 });
@Schema({
  collection: COLLECTION_NAMES.ORGANIZATION_BRANDING,
  timestamps: true,
})
export class OrganizationBranding {
  @Prop({ type: Types.ObjectId, ref: Organization.name, required: true })
  organizationId!: Types.ObjectId;

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ trim: true })
  primaryColor?: string;

  @Prop({ trim: true })
  secondaryColor?: string;

  @Prop({ trim: true })
  senderName?: string;

  @Prop({ type: [String], default: [] })
  domains!: string[];

  @Prop({ type: Object, default: {} })
  theme!: Record<string, unknown>;
}

export const OrganizationBrandingSchema =
  SchemaFactory.createForClass(OrganizationBranding);
OrganizationBrandingSchema.index({ organizationId: 1 }, { unique: true });

@Schema({
  collection: COLLECTION_NAMES.CHANNEL_SETTING,
  timestamps: true,
})
export class ChannelSetting {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({
    enum: ['whatsapp', 'sms', 'email', 'call_center', 'payment', 'calendar'],
    required: true,
  })
  channel!: string;

  @Prop({ enum: ['disabled', 'sandbox', 'active'], default: 'sandbox' })
  status!: string;

  @Prop({ type: Object, default: {} })
  provider!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  limits!: Record<string, unknown>;
}

export const ChannelSettingSchema =
  SchemaFactory.createForClass(ChannelSetting);
ChannelSettingSchema.index({ organizationId: 1, channel: 1 }, { unique: true });
ChannelSettingSchema.index({ organizationId: 1, status: 1, channel: 1 });

@Schema({
  collection: COLLECTION_NAMES.LEAD_SOURCE,
  timestamps: true,
})
export class LeadSource {
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

  @Prop({
    enum: [
      'website',
      'landing_page',
      'facebook',
      'google',
      'whatsapp',
      'offline',
      'walk_in',
      'referral',
      'import',
      'partner',
      'api',
    ],
    default: 'website',
  })
  category!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const LeadSourceSchema = SchemaFactory.createForClass(LeadSource);
LeadSourceSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadSourceSchema.index({ organizationId: 1, status: 1, name: 1 });

@Schema({
  collection: COLLECTION_NAMES.LEAD_STAGE,
  timestamps: true,
})
export class LeadStage {
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

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: false })
  isInitial!: boolean;

  @Prop({ default: false })
  isConverted!: boolean;

  @Prop({ default: false })
  isLost!: boolean;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const LeadStageSchema = SchemaFactory.createForClass(LeadStage);
LeadStageSchema.index({ organizationId: 1, code: 1 }, { unique: true });
LeadStageSchema.index({ organizationId: 1, status: 1, order: 1, name: 1 });
