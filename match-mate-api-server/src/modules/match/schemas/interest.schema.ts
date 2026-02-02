import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InterestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Interest extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  receiverId: Types.ObjectId;

  @Prop({
    type: String,
    enum: InterestStatus,
    default: InterestStatus.PENDING,
  })
  status: InterestStatus;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

InterestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
