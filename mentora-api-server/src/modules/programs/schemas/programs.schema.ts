import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '../../organizations/schemas/organization.schema';

export type ProgramDocument = HydratedDocument<Program>;

@Schema({
  collection: COLLECTION_NAMES.PROGRAM,
  timestamps: true,
})
export class Program {
  @Prop({
    type: Types.ObjectId,
    ref: Organization.name,
    required: true,
    index: true,
  })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code!: string;

  @Prop({
    enum: [
      'school',
      'undergraduate',
      'postgraduate',
      'diploma',
      'certificate',
      'competitive_exam',
      'skill_course',
    ],
    default: 'competitive_exam',
    index: true,
  })
  level!: string;

  @Prop({ trim: true })
  specialization?: string;

  @Prop({ default: 0, min: 0 })
  durationMonths!: number;

  @Prop({ default: 0, min: 0 })
  credits!: number;

  @Prop({ trim: true })
  eligibility?: string;

  @Prop({ default: 0, min: 0 })
  intakeCapacity!: number;

  @Prop({ default: 0, min: 0 })
  seatsAvailable!: number;

  @Prop({ default: 0, min: 0 })
  feeAmount!: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'active',
    index: true,
  })
  status!: string;
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
ProgramSchema.index({ organizationId: 1, createdAt: -1 });
ProgramSchema.index({ organizationId: 1, code: 1 }, { unique: true });
ProgramSchema.index({ organizationId: 1, status: 1, level: 1 });
