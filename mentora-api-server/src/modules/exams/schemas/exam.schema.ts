import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { Subject } from '@/modules/learning/schemas/learning.schemas';

export type ExamDocument = HydratedDocument<Exam>;

@Schema({ _id: false })
export class ExamResultEntry {
  // Org-scoped CRM "student" resource id (see StudentAttendance for why
  // this isn't the Learning-domain StudentProfile).
  @Prop({ type: Types.ObjectId, required: true })
  studentId!: Types.ObjectId;

  @Prop({ default: 0 })
  marksObtained!: number;

  @Prop({ default: false })
  isAbsent!: boolean;

  @Prop({ trim: true })
  grade?: string;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ default: 0 })
  percentage!: number;

  @Prop({ default: false })
  passed!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  enteredBy?: Types.ObjectId;

  @Prop({ default: () => new Date() })
  enteredAt!: Date;
}

export const ExamResultEntrySchema =
  SchemaFactory.createForClass(ExamResultEntry);

@Schema({ collection: COLLECTION_NAMES.EXAM, timestamps: true })
export class Exam {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({
    enum: [
      'unit_test',
      'midterm',
      'final_term',
      'board',
      'entrance',
      'mock',
      'other',
    ],
    default: 'unit_test',
    index: true,
  })
  examType!: string;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grade', index: true })
  gradeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  academicSessionId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  examDate!: Date;

  @Prop()
  startTime?: string;

  @Prop({ default: 0 })
  durationMinutes!: number;

  @Prop({ required: true, default: 100 })
  maxMarks!: number;

  @Prop({ default: 0 })
  passingMarks!: number;

  @Prop({ trim: true })
  venue?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  invigilatorUserId?: Types.ObjectId;

  @Prop({ trim: true })
  instructions?: string;

  @Prop({ enum: ['offline', 'online', 'hybrid'], default: 'offline' })
  mode!: string;

  @Prop({ default: false })
  proctoringRequired!: boolean;

  @Prop()
  resultPublishedAt?: Date;

  @Prop({
    enum: [
      'scheduled',
      'ongoing',
      'completed',
      'results_published',
      'cancelled',
    ],
    default: 'scheduled',
    index: true,
  })
  status!: string;

  @Prop({ type: [ExamResultEntrySchema], default: [] })
  results!: ExamResultEntry[];

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
ExamSchema.index({ organizationId: 1, subjectId: 1, examDate: -1 });
ExamSchema.index({ organizationId: 1, gradeId: 1, examDate: -1 });
ExamSchema.index({ organizationId: 1, status: 1, examDate: -1 });
ExamSchema.index({ organizationId: 1, branchId: 1, examDate: -1 });
ExamSchema.index({ organizationId: 1, 'results.studentId': 1 });
