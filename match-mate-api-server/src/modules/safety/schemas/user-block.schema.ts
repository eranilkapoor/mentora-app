import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.USER_BLOCK, timestamps: true })
export class UserBlock {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  blockedUserId!: Types.ObjectId;
}

export type UserBlockDocument = UserBlock & Document;
export const UserBlockSchema = SchemaFactory.createForClass(UserBlock);

UserBlockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });
