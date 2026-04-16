import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
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
    enum: InteractionType,
  })
  type!: InteractionType;

  @Prop({
    enum: InteractionStatus,
  })
  status!: InteractionStatus;

  @Prop()
  metadata?: any;
}

export type InteractionDocument = Interaction & Document;
export const InteractionSchema = SchemaFactory.createForClass(Interaction);

InteractionSchema.index({ fromUserId: 1, createdAt: -1 });
InteractionSchema.index({ toUserId: 1, type: 1 });
InteractionSchema.index({ fromUserId: 1, toUserId: 1, type: 1 });
