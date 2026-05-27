import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { InteractionType } from '../../enums/interaction-type.enum';

export enum InteractionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ collection: COLLECTIONS.INTERACTION, timestamps: true })
export class Interaction {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  fromUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  toUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: InteractionType,
    required: true,
    index: true,
  })
  type!: InteractionType;

  @Prop({
    type: String,
    enum: InteractionStatus,
    required: true,
    default: InteractionStatus.PENDING,
    index: true,
  })
  status!: InteractionStatus;

  // Fixed: use SchemaTypes.Mixed or type: Object
  // to let Mongoose handle arbitrary key-value data
  @Prop({ type: Object, default: null })
  metadata?: Record<string, unknown> | null;

  @Prop()
  message?: string;
}

export type InteractionDocument = Interaction & Document;
export const InteractionSchema = SchemaFactory.createForClass(Interaction);

// Prevents duplicate interactions of the same type between same users
InteractionSchema.index(
  { fromUserId: 1, toUserId: 1, type: 1 },
  { unique: true },
);

InteractionSchema.index({ fromUserId: 1, createdAt: -1 });
InteractionSchema.index({ toUserId: 1, type: 1, status: 1 });
InteractionSchema.index({ status: 1, createdAt: -1 });
