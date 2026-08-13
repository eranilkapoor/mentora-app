import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organizations.schema';

export type StaffAttendanceDocument = HydratedDocument<StaffAttendance>;

@Schema({ collection: COLLECTION_NAMES.STAFF_ATTENDANCE, timestamps: true })
export class StaffAttendance {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', index: true })
  departmentId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({
    enum: [
      'present',
      'absent',
      'late',
      'half_day',
      'on_leave',
      'work_from_home',
    ],
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

  @Prop({ trim: true })
  remarks?: string;
}

export const StaffAttendanceSchema =
  SchemaFactory.createForClass(StaffAttendance);
StaffAttendanceSchema.index({ organizationId: 1, userId: 1, date: -1 });
StaffAttendanceSchema.index({ organizationId: 1, date: 1, status: 1 });
StaffAttendanceSchema.index({ organizationId: 1, branchId: 1, date: 1 });
