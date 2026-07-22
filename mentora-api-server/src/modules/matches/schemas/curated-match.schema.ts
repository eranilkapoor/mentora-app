import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { CuratedMatchStatus } from '../enums/match.enums';

@Schema({ collection: COLLECTION_NAMES.CURATED_MATCH, timestamps: true })
export class CuratedMatch {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  profileUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  curatedById!: Types.ObjectId;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  @Prop({ trim: true, index: true })
  source?: string;

  @Prop({ trim: true, maxlength: 250 })
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  version!: number;

  @Prop({ default: 0, min: 0, max: 100, index: true })
  priority!: number;

  @Prop({
    type: String,
    enum: CuratedMatchStatus,
    default: CuratedMatchStatus.ACTIVE,
    index: true,
  })
  status!: CuratedMatchStatus;

  @Prop()
  expiresAt?: Date;

  @Prop()
  dismissedAt?: Date;

  @Prop({ index: true })
  deletedAt?: Date;

  @Prop({ index: true })
  anonymizedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  retentionReason?: string;

  @Prop()
  legalHoldUntil?: Date;
}

export type CuratedMatchDocument = CuratedMatch & Document;
export const CuratedMatchSchema = SchemaFactory.createForClass(CuratedMatch);

CuratedMatchSchema.index({ userId: 1, status: 1, priority: -1, createdAt: -1 });
CuratedMatchSchema.index({ profileUserId: 1, status: 1 });
CuratedMatchSchema.index({ anonymizedAt: 1, retentionReason: 1 });
CuratedMatchSchema.index({ legalHoldUntil: 1 });
CuratedMatchSchema.index(
  { userId: 1, profileUserId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: CuratedMatchStatus.ACTIVE },
  },
);
