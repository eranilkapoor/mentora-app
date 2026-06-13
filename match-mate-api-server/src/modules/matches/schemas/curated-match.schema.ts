import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export enum CuratedMatchStatus {
  ACTIVE = 'active',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired',
}

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
}

export type CuratedMatchDocument = CuratedMatch & Document;
export const CuratedMatchSchema = SchemaFactory.createForClass(CuratedMatch);

CuratedMatchSchema.index({ userId: 1, status: 1, priority: -1, createdAt: -1 });
CuratedMatchSchema.index({ profileUserId: 1, status: 1 });
CuratedMatchSchema.index(
  { userId: 1, profileUserId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: CuratedMatchStatus.ACTIVE },
  },
);
