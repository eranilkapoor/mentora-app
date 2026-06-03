import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.MATCH, timestamps: true })
export class Match {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  targetUserId!: Types.ObjectId;

  @Prop()
  score!: number;

  @Prop()
  matchedOn?: Date;

  @Prop({ default: false })
  isMutual!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId })
  unmatchedBy?: Types.ObjectId;

  @Prop()
  unmatchedAt?: Date;

  @Prop({ trim: true, maxlength: 250 })
  unmatchReason?: string;
}

export type MatchDocument = Match & Document;
export const MatchSchema = SchemaFactory.createForClass(Match);

MatchSchema.index({ score: 1, isActive: 1 });
MatchSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });
