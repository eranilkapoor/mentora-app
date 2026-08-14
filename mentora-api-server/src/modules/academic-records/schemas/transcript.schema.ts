import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { Organization } from '@/modules/organizations/schemas/organization.schema';
import { ReportCard } from './report-card.schema';

export type TranscriptDocument = HydratedDocument<Transcript>;

@Schema({ collection: COLLECTION_NAMES.TRANSCRIPT, timestamps: true })
export class Transcript {
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

  @Prop({
    enum: ['full_academic_history', 'provisional', 'migration', 'custom'],
    default: 'full_academic_history',
    index: true,
  })
  transcriptType!: string;

  @Prop({ type: [Types.ObjectId], ref: ReportCard.name, default: [] })
  reportCardIds!: Types.ObjectId[];

  @Prop()
  cumulativeGpa?: number;

  @Prop()
  cumulativePercentage?: number;

  @Prop({ trim: true })
  overallGrade?: string;

  @Prop({ trim: true })
  purpose?: string;

  @Prop({
    enum: ['draft', 'issued', 'revoked'],
    default: 'draft',
    index: true,
  })
  status!: string;

  @Prop()
  issuedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Document' })
  documentId?: Types.ObjectId;

  @Prop({ trim: true })
  recipientName?: string;

  @Prop({ trim: true })
  recipientEmail?: string;

  @Prop()
  expiresAt?: Date;

  // Lets a third party (university, employer) verify authenticity without
  // exposing the full record — checked via a public lookup endpoint.
  @Prop({ trim: true })
  verificationCode?: string;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
TranscriptSchema.index({
  organizationId: 1,
  studentId: 1,
  createdAt: -1,
});
TranscriptSchema.index({ organizationId: 1, status: 1 });
TranscriptSchema.index({ verificationCode: 1 }, { unique: true, sparse: true });
