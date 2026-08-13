import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { Subject } from '@/modules/learning/schemas/learning.schemas';

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema({ collection: COLLECTION_NAMES.TIMETABLE, timestamps: true })
export class Timetable {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Grade', index: true })
  gradeId?: Types.ObjectId;

  // Free-text since no dedicated Section/Room entity exists yet — lets any
  // org type (school section, coaching batch, university room) label a slot
  // without a schema migration.
  @Prop({ trim: true })
  sectionLabel?: string;

  @Prop({ trim: true })
  roomLabel?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  staffUserId!: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6, index: true })
  dayOfWeek!: number;

  // Stored as "HH:mm" (24h) since slots recur weekly rather than on a fixed
  // calendar date.
  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop()
  effectiveFrom?: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop({ type: Types.ObjectId })
  academicSessionId?: Types.ObjectId;

  @Prop({
    enum: ['active', 'cancelled'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  createdBy?: Types.ObjectId;
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
TimetableSchema.index({
  organizationId: 1,
  staffUserId: 1,
  dayOfWeek: 1,
  status: 1,
});
TimetableSchema.index({
  organizationId: 1,
  roomLabel: 1,
  dayOfWeek: 1,
  status: 1,
});
TimetableSchema.index({ organizationId: 1, subjectId: 1, dayOfWeek: 1 });
TimetableSchema.index({ organizationId: 1, gradeId: 1, dayOfWeek: 1 });
TimetableSchema.index({ organizationId: 1, branchId: 1, dayOfWeek: 1 });
