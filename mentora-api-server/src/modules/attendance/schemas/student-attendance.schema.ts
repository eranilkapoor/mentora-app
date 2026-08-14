import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';

export type StudentAttendanceDocument = HydratedDocument<StudentAttendance>;

@Schema({ collection: COLLECTION_NAMES.STUDENT_ATTENDANCE, timestamps: true })
export class StudentAttendance {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  // Points at the org-scoped CRM "student" resource (education-records'
  // dynamically-registered Student collection), not the org-agnostic
  // Learning-domain StudentProfile — CRM staff only ever pick from their
  // own organization's roster.
  @Prop({ type: Types.ObjectId, required: true, index: true })
  studentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subject', index: true })
  subjectId?: Types.ObjectId;

  // Optional link to the recurring Timetable slot this attendance was taken
  // against, so period-wise attendance can be traced back to the schedule.
  @Prop({ type: Types.ObjectId, ref: 'Timetable', index: true })
  timetableId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({
    enum: ['present', 'absent', 'late', 'half_day', 'excused', 'on_leave'],
    required: true,
    index: true,
  })
  status!: string;

  @Prop({
    enum: ['manual', 'biometric', 'rfid', 'qr', 'self'],
    default: 'manual',
  })
  method!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  markedBy!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  markedAt!: Date;

  @Prop()
  checkInTime?: Date;

  @Prop()
  checkOutTime?: Date;

  @Prop({ default: 0 })
  minutesAttended!: number;

  @Prop({ trim: true })
  deviceId?: string;

  @Prop({ type: Object, default: {} })
  geo!: Record<string, unknown>;

  @Prop({ trim: true })
  remarks?: string;
}

export const StudentAttendanceSchema =
  SchemaFactory.createForClass(StudentAttendance);
StudentAttendanceSchema.index({
  organizationId: 1,
  studentId: 1,
  date: -1,
});
StudentAttendanceSchema.index({ organizationId: 1, date: 1, status: 1 });
StudentAttendanceSchema.index({
  organizationId: 1,
  timetableId: 1,
  date: 1,
});
StudentAttendanceSchema.index({ organizationId: 1, branchId: 1, date: 1 });
StudentAttendanceSchema.index({
  organizationId: 1,
  subjectId: 1,
  date: 1,
  status: 1,
});
