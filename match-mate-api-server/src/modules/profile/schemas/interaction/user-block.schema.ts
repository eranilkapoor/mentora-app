import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.USER_BLOCK, timestamps: true })
export class UserBlock {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  blockedUserId!: Types.ObjectId;
}

export type UserBlockDocument = UserBlock & Document;
export const UserBlockSchema = SchemaFactory.createForClass(UserBlock);