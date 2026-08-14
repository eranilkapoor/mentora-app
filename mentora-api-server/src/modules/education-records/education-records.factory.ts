import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

@Schema({ timestamps: true })
export class EducationRecord {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

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

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StudentProfile', index: true })
  studentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ParentProfile', index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Program', index: true })
  programId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', index: true })
  subjectId?: Types.ObjectId;

  @Prop({ trim: true })
  code?: string;

  @Prop({ trim: true })
  academicYear?: string;

  @Prop({ trim: true })
  batchName?: string;

  @Prop({ trim: true })
  grade?: string;

  @Prop({ trim: true })
  level?: string;

  @Prop({ trim: true })
  courseName?: string;

  @Prop({ trim: true })
  specializationName?: string;

  @Prop({ trim: true })
  stream?: string;

  @Prop({ trim: true })
  eligibility?: string;

  @Prop({ enum: ['online', 'offline', 'hybrid'], default: 'hybrid' })
  deliveryMode!: string;

  @Prop({ default: 0, min: 0 })
  seats!: number;

  @Prop({ default: 0, min: 0 })
  amount!: number;

  @Prop({ trim: true, default: 'INR' })
  currency!: string;

  @Prop()
  startAt?: Date;

  @Prop()
  endAt?: Date;

  @Prop()
  dueDate?: Date;

  @Prop({
    enum: ['pending', 'active', 'provisioned', 'failed', 'cancelled'],
    default: 'pending',
  })
  provisioningStatus!: string;

  @Prop({
    enum: ['pending', 'paid', 'partial', 'overdue', 'waived', 'refunded'],
    default: 'pending',
  })
  paymentStatus!: string;

  @Prop({ index: true })
  dueAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  @Prop({ type: Object, default: {} })
  payload!: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export type EducationRecordDocument = HydratedDocument<EducationRecord>;

export function createEducationRecordSchema(collection: string) {
  const schema = SchemaFactory.createForClass(EducationRecord);
  schema.set('collection', collection);
  schema.index({ organizationId: 1, status: 1, dueAt: 1 });
  schema.index({ organizationId: 1, ownerId: 1, status: 1, dueAt: 1 });
  schema.index({ organizationId: 1, title: 1, createdAt: -1 });
  schema.index({ organizationId: 1, branchId: 1, status: 1 });
  schema.index({ organizationId: 1, studentId: 1, createdAt: -1 });
  schema.index({ organizationId: 1, programId: 1, status: 1 });
  schema.index({ organizationId: 1, code: 1 }, { sparse: true });
  return {
    modelName: collection
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(''),
    schema,
  };
}
