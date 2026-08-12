import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { LeadSource } from '@/common/crm/schemas/lead-source.schema';
import { LeadStage } from '@/common/crm/schemas/lead-stage.schema';
import { Branch } from '@/modules/organizations/schemas/branch.schema';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ _id: false })
export class LeadAttachment {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true })
  fileName?: string;

  @Prop({ trim: true })
  mimeType?: string;

  @Prop({ default: 0 })
  size!: number;

  @Prop({
    enum: ['document', 'image', 'audio', 'voice_note', 'other'],
    default: 'document',
  })
  type!: string;
}

@Schema({
  collection: COLLECTION_NAMES.LEAD,
  timestamps: true,
})
export class Lead {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ trim: true })
  middleName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true, index: true })
  leadNumber?: string;

  @Prop({
    enum: [
      'student_enquiry',
      'parent_enquiry',
      'organization_demo',
      'institution_admission',
      'course_enquiry',
      'exam_prep',
      'partner_referral',
      'walk_in',
      'support_to_sales',
      'other',
    ],
    default: 'student_enquiry',
    index: true,
  })
  leadType!: string;

  @Prop({
    enum: [
      'student',
      'parent',
      'guardian',
      'organization_admin',
      'school',
      'college',
      'university',
      'coaching_institute',
      'partner',
      'agent',
      'other',
    ],
    default: 'student',
    index: true,
  })
  persona!: string;

  @Prop({ lowercase: true, trim: true, index: true })
  email?: string;

  @Prop({ trim: true, index: true })
  phone?: string;

  @Prop({ trim: true })
  alternatePhone?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ trim: true })
  gender?: string;

  @Prop({ trim: true })
  preferredLanguage?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  postalCode?: string;

  @Prop({ trim: true })
  fullAddress?: string;

  @Prop({ type: Types.ObjectId, ref: LeadSource.name, index: true })
  sourceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LeadStage.name, index: true })
  stageId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Branch.name, index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', index: true })
  teamId?: Types.ObjectId;

  @Prop({ trim: true })
  preferredBranch?: string;

  @Prop({ trim: true })
  campaign?: string;

  @Prop({ trim: true })
  subSource?: string;

  @Prop({ trim: true })
  referral?: string;

  @Prop({ trim: true })
  partner?: string;

  @Prop({ trim: true })
  landingPage?: string;

  @Prop({ trim: true })
  formSource?: string;

  @Prop({
    enum: [
      'website',
      'landing_page',
      'google_ads',
      'meta_ads',
      'whatsapp',
      'call',
      'walk_in',
      'education_fair',
      'referral',
      'partner',
      'import',
      'api',
      'mobile_app',
      'public_website',
      'other',
    ],
    default: 'website',
    index: true,
  })
  captureChannel!: string;

  @Prop({ type: [String], default: [] })
  interestedPrograms!: string[];

  @Prop({ trim: true })
  academicLevel?: string;

  @Prop({ trim: true })
  interestedCourse?: string;

  @Prop({ trim: true })
  specialization?: string;

  @Prop({ trim: true })
  academicSession?: string;

  @Prop({ trim: true })
  preferredMode?: string;

  @Prop({ trim: true })
  intake?: string;

  @Prop({ trim: true })
  assignmentMethod?: string;

  @Prop({ trim: true })
  currentQualification?: string;

  @Prop({ trim: true })
  percentageOrCgpa?: string;

  @Prop()
  graduationYear?: number;

  @Prop({ trim: true })
  entranceExam?: string;

  @Prop({ trim: true })
  examScore?: string;

  @Prop({ trim: true })
  workExperience?: string;

  @Prop({ trim: true })
  budgetRange?: string;

  @Prop({ trim: true })
  preferredLocation?: string;

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ type: [LeadAttachment], default: [] })
  attachments!: LeadAttachment[];

  @Prop({ type: [LeadAttachment], default: [] })
  voiceNotes!: LeadAttachment[];

  @Prop({ default: 0, min: 0, max: 100 })
  score!: number;

  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;

  @Prop({ type: Object, default: {} })
  scoreBreakdown!: Record<string, unknown>;

  @Prop({ enum: ['cold', 'warm', 'hot'], default: 'warm', index: true })
  temperature!: string;

  @Prop({
    enum: ['new', 'open', 'won', 'lost', 'duplicate', 'archived'],
    default: 'new',
    index: true,
  })
  status!: string;

  @Prop()
  nextFollowUpAt?: Date;

  @Prop({ trim: true })
  followUpType?: string;

  @Prop({ trim: true })
  followUpNote?: string;

  @Prop({ trim: true })
  lostReason?: string;

  @Prop({ trim: true })
  disqualificationReason?: string;

  @Prop({ default: false, index: true })
  duplicateIndicator!: boolean;

  @Prop({ trim: true })
  consentStatus?: string;

  @Prop()
  lastContactedAt?: Date;

  @Prop()
  slaDueAt?: Date;

  @Prop({ enum: ['healthy', 'at_risk', 'breached'], default: 'healthy' })
  slaStatus!: string;

  @Prop({ type: Object, default: {} })
  utm!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  customFields!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
LeadSchema.index({ organizationId: 1, phone: 1 });
LeadSchema.index({ organizationId: 1, email: 1 });
LeadSchema.index({ organizationId: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
LeadSchema.index({
  organizationId: 1,
  assignedTo: 1,
  stageId: 1,
  createdAt: -1,
});
LeadSchema.index({ organizationId: 1, nextFollowUpAt: 1 });
LeadSchema.index({ organizationId: 1, tags: 1 });
LeadSchema.index({ organizationId: 1, score: -1, temperature: 1 });
LeadSchema.index({ organizationId: 1, leadType: 1, status: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, captureChannel: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, campaign: 1, createdAt: -1 });
LeadSchema.index({ organizationId: 1, departmentId: 1, teamId: 1 });
