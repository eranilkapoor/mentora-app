import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type CrmTenantDocument = HydratedDocument<CrmTenant>;
export type CrmBranchDocument = HydratedDocument<CrmBranch>;
export type CrmLeadSourceDocument = HydratedDocument<CrmLeadSource>;
export type CrmLeadStageDocument = HydratedDocument<CrmLeadStage>;
export type CrmLeadDocument = HydratedDocument<CrmLead>;
export type CrmLeadActivityDocument = HydratedDocument<CrmLeadActivity>;
export type CrmLeadAssignmentDocument = HydratedDocument<CrmLeadAssignment>;
export type CrmApplicationDocument = HydratedDocument<CrmApplication>;
export type CrmTaskDocument = HydratedDocument<CrmTask>;
export type CrmCampaignDocument = HydratedDocument<CrmCampaign>;
export type CrmCommunicationDocument = HydratedDocument<CrmCommunication>;
export type CrmModuleRecordDocument = HydratedDocument<CrmModuleRecord>;
export type CrmUserMembershipDocument = HydratedDocument<CrmUserMembership>;

export const CRM_PARTIAL_MODULE_KEYS = [
  'authentication',
  'user_management',
  'organization_management',
  'lead_management',
  'application_management',
  'admission_management',
  'marketing_automation',
  'communication',
  'call_center',
  'whatsapp_crm',
  'email_crm',
  'sms',
  'mobile_crm',
  'calendar',
  'task_management',
  'document_management',
  'payment',
  'finance',
  'scholarship',
  'interview',
  'event_management',
  'field_force_automation',
  'reports',
  'dashboard',
  'analytics',
  'ai_features',
  'integrations',
  'security',
] as const;

@Schema({ collection: COLLECTION_NAMES.CRM_TENANT, timestamps: true })
export class CrmTenant {
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

export const CrmTenantSchema = SchemaFactory.createForClass(CrmTenant);

@Schema({ collection: COLLECTION_NAMES.CRM_BRANCH, timestamps: true })
export class CrmBranch {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

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

export const CrmBranchSchema = SchemaFactory.createForClass(CrmBranch);
CrmBranchSchema.index({ tenantId: 1, code: 1 }, { unique: true });

@Schema({ collection: COLLECTION_NAMES.CRM_LEAD_SOURCE, timestamps: true })
export class CrmLeadSource {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

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

export const CrmLeadSourceSchema = SchemaFactory.createForClass(CrmLeadSource);
CrmLeadSourceSchema.index({ tenantId: 1, code: 1 }, { unique: true });

@Schema({ collection: COLLECTION_NAMES.CRM_LEAD_STAGE, timestamps: true })
export class CrmLeadStage {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

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

export const CrmLeadStageSchema = SchemaFactory.createForClass(CrmLeadStage);
CrmLeadStageSchema.index({ tenantId: 1, code: 1 }, { unique: true });

@Schema({ collection: COLLECTION_NAMES.CRM_LEAD, timestamps: true })
export class CrmLead {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ lowercase: true, trim: true, index: true })
  email?: string;

  @Prop({ trim: true, index: true })
  phone?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ type: Types.ObjectId, ref: CrmLeadSource.name, index: true })
  sourceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CrmLeadStage.name, index: true })
  stageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CrmBranch.name, index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  interestedPrograms!: string[];

  @Prop({ default: 0, min: 0, max: 100 })
  score!: number;

  @Prop({ enum: ['cold', 'warm', 'hot'], default: 'warm', index: true })
  temperature!: string;

  @Prop({
    enum: ['new', 'open', 'won', 'lost', 'duplicate'],
    default: 'new',
    index: true,
  })
  status!: string;

  @Prop()
  nextFollowUpAt?: Date;

  @Prop()
  lastContactedAt?: Date;

  @Prop({ type: Object, default: {} })
  utm!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  customFields!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const CrmLeadSchema = SchemaFactory.createForClass(CrmLead);
CrmLeadSchema.index({ tenantId: 1, phone: 1 });
CrmLeadSchema.index({ tenantId: 1, email: 1 });
CrmLeadSchema.index({ tenantId: 1, assignedTo: 1, stageId: 1, createdAt: -1 });
CrmLeadSchema.index({ tenantId: 1, nextFollowUpAt: 1 });

@Schema({ collection: COLLECTION_NAMES.CRM_LEAD_ACTIVITY, timestamps: true })
export class CrmLeadActivity {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CrmLead.name,
    required: true,
    index: true,
  })
  leadId!: Types.ObjectId;

  @Prop({
    enum: [
      'lead_created',
      'assignment_changed',
      'stage_changed',
      'note_added',
      'call_made',
      'email_sent',
      'sms_sent',
      'whatsapp_sent',
      'task_created',
      'application_started',
      'payment_received',
    ],
    required: true,
  })
  type!: string;

  @Prop({ enum: ['inbound', 'outbound', 'internal'], default: 'internal' })
  direction!: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  performedBy?: Types.ObjectId;

  @Prop({ default: Date.now, index: true })
  occurredAt!: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const CrmLeadActivitySchema =
  SchemaFactory.createForClass(CrmLeadActivity);
CrmLeadActivitySchema.index({ tenantId: 1, leadId: 1, occurredAt: -1 });

@Schema({ collection: COLLECTION_NAMES.CRM_LEAD_ASSIGNMENT, timestamps: true })
export class CrmLeadAssignment {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CrmLead.name,
    required: true,
    index: true,
  })
  leadId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedBy?: Types.ObjectId;

  @Prop({
    enum: [
      'manual',
      'round_robin',
      'course_based',
      'branch_based',
      'location_based',
      'workflow',
    ],
    default: 'manual',
  })
  assignmentMethod!: string;

  @Prop({ default: Date.now })
  assignedAt!: Date;
}

export const CrmLeadAssignmentSchema =
  SchemaFactory.createForClass(CrmLeadAssignment);
CrmLeadAssignmentSchema.index({ tenantId: 1, leadId: 1, assignedAt: -1 });

@Schema({ collection: COLLECTION_NAMES.CRM_APPLICATION, timestamps: true })
export class CrmApplication {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  applicationNumber!: string;

  @Prop({ type: Types.ObjectId, ref: CrmLead.name, index: true })
  leadId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  courseOffering!: string;

  @Prop({
    enum: [
      'draft',
      'submitted',
      'under_review',
      'document_verification',
      'interview',
      'offer_issued',
      'admission_confirmed',
      'rejected',
      'withdrawn',
    ],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop({ default: 0, min: 0, max: 100 })
  completenessPercentage!: number;

  @Prop()
  submittedAt?: Date;

  @Prop({ type: Object, default: {} })
  applicantProfile!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  formResponses!: Record<string, unknown>;
}

export const CrmApplicationSchema =
  SchemaFactory.createForClass(CrmApplication);
CrmApplicationSchema.index(
  { tenantId: 1, applicationNumber: 1 },
  { unique: true },
);
CrmApplicationSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

@Schema({ collection: COLLECTION_NAMES.CRM_TASK, timestamps: true })
export class CrmTask {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'student', 'payment', 'campaign', 'general'],
    required: true,
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedBy?: Types.ObjectId;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  })
  priority!: string;

  @Prop({
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({ index: true })
  dueAt?: Date;
}

export const CrmTaskSchema = SchemaFactory.createForClass(CrmTask);
CrmTaskSchema.index({ tenantId: 1, assignedTo: 1, status: 1, dueAt: 1 });

@Schema({ collection: COLLECTION_NAMES.CRM_CAMPAIGN, timestamps: true })
export class CrmCampaign {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'push', 'ads', 'landing_page'],
    required: true,
    index: true,
  })
  channel!: string;

  @Prop({
    enum: ['draft', 'scheduled', 'running', 'completed', 'paused'],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop({ type: Object, default: {} })
  metrics!: Record<string, unknown>;
}

export const CrmCampaignSchema = SchemaFactory.createForClass(CrmCampaign);
CrmCampaignSchema.index({ tenantId: 1, channel: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.CRM_COMMUNICATION, timestamps: true })
export class CrmCommunication {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    enum: ['lead', 'application', 'student', 'payment', 'general'],
    required: true,
    index: true,
  })
  entityType!: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId!: Types.ObjectId;

  @Prop({
    enum: ['email', 'sms', 'whatsapp', 'push', 'call', 'in_app'],
    required: true,
    index: true,
  })
  channel!: string;

  @Prop({ enum: ['inbound', 'outbound'], default: 'outbound' })
  direction!: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop()
  content?: string;

  @Prop({
    enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'bounced'],
    default: 'queued',
    index: true,
  })
  status!: string;
}

export const CrmCommunicationSchema =
  SchemaFactory.createForClass(CrmCommunication);
CrmCommunicationSchema.index({
  tenantId: 1,
  entityType: 1,
  entityId: 1,
  createdAt: -1,
});

@Schema({ collection: COLLECTION_NAMES.CRM_MODULE_RECORD, timestamps: true })
export class CrmModuleRecord {
  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ enum: CRM_PARTIAL_MODULE_KEYS, required: true, index: true })
  moduleKey!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ['draft', 'open', 'in_progress', 'blocked', 'completed', 'archived'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  })
  priority!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const CrmModuleRecordSchema =
  SchemaFactory.createForClass(CrmModuleRecord);
CrmModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, status: 1 });
CrmModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, dueAt: 1 });
CrmModuleRecordSchema.index({ tenantId: 1, moduleKey: 1, ownerId: 1 });

export const CRM_USER_ROLES = [
  'super_admin',
  'organization_admin',
  'branch_admin',
  'admission_manager',
  'admission_counselor',
  'marketing_executive',
  'sales_executive',
  'call_center',
  'finance',
  'field_agent',
  'student',
  'parent',
] as const;

@Schema({ collection: COLLECTION_NAMES.CRM_USER_MEMBERSHIP, timestamps: true })
export class CrmUserMembership {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: CrmTenant.name,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: CrmBranch.name, default: [] })
  branchIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  departmentIds!: string[];

  @Prop({ enum: CRM_USER_ROLES, required: true, index: true })
  role!: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const CrmUserMembershipSchema =
  SchemaFactory.createForClass(CrmUserMembership);
CrmUserMembershipSchema.index(
  { userId: 1, tenantId: 1, role: 1 },
  { unique: true },
);
CrmUserMembershipSchema.index({ tenantId: 1, role: 1, status: 1 });
