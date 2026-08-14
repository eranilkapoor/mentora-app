import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { Subject } from '@/modules/learning/schemas/learning.schemas';

export type ReportCardDocument = HydratedDocument<ReportCard>;

@Schema({ _id: false })
export class ReportCardSubjectEntry {
  @Prop({ type: Types.ObjectId, ref: Subject.name, required: true })
  subjectId!: Types.ObjectId;

  // Snapshot so a report card stays accurate even if the subject is later
  // renamed or removed from the academic taxonomy.
  @Prop({ required: true, trim: true })
  subjectName!: string;

  @Prop({ default: 0 })
  marksObtained!: number;

  @Prop({ required: true, default: 100 })
  maxMarks!: number;

  @Prop({ trim: true })
  grade?: string;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ default: 0 })
  attendancePercentage?: number;
}

export const ReportCardSubjectEntrySchema = SchemaFactory.createForClass(
  ReportCardSubjectEntry,
);

@Schema({ collection: COLLECTION_NAMES.REPORT_CARD, timestamps: true })
export class ReportCard {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  // Org-scoped CRM "student" resource id (see StudentAttendance for why
  // this isn't the Learning-domain StudentProfile).
  @Prop({ type: Types.ObjectId, required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  academicSessionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grade', index: true })
  gradeId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  term!: string;

  @Prop({ type: [ReportCardSubjectEntrySchema], default: [] })
  subjects!: ReportCardSubjectEntry[];

  @Prop({ default: 0 })
  totalMarksObtained!: number;

  @Prop({ default: 0 })
  totalMaxMarks!: number;

  @Prop({ default: 0 })
  percentage!: number;

  @Prop()
  gpa?: number;

  @Prop()
  rank?: number;

  @Prop()
  attendancePercentage?: number;

  @Prop({ trim: true })
  overallGrade?: string;

  @Prop({ trim: true })
  teacherRemarks?: string;

  @Prop({ trim: true })
  principalRemarks?: string;

  @Prop({
    enum: ['draft', 'published', 'revised'],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop()
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  generatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Document' })
  documentId?: Types.ObjectId;

  @Prop({ default: false })
  parentNotified!: boolean;

  @Prop()
  parentNotifiedAt?: Date;
}

export const ReportCardSchema = SchemaFactory.createForClass(ReportCard);
ReportCardSchema.index({
  organizationId: 1,
  studentId: 1,
  academicSessionId: 1,
  term: 1,
});
ReportCardSchema.index({
  organizationId: 1,
  studentId: 1,
  createdAt: -1,
});
ReportCardSchema.index({ organizationId: 1, gradeId: 1, term: 1 });
ReportCardSchema.index({ organizationId: 1, status: 1 });
