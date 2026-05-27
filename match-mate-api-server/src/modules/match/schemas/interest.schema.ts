import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';

export enum InterestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ collection: COLLECTIONS.INTEREST, timestamps: true })
export class Interest {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  receiverId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: InterestStatus,
    default: InterestStatus.PENDING,
    index: true,
  })
  status!: InterestStatus;

  @Prop()
  message?: string;
}

export type InterestDocument = Interest & Document;
export const InterestSchema = SchemaFactory.createForClass(Interest);

InterestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
InterestSchema.index({ receiverId: 1, status: 1 });
InterestSchema.index({ senderId: 1, status: 1 });
