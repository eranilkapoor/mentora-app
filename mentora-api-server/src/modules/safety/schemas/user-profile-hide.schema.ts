import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.USER_PROFILE_HIDE, timestamps: true })
export class UserProfileHide {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  hiddenUserId!: Types.ObjectId;

  @Prop({ trim: true, maxlength: 250 })
  reason?: string;
}

export type UserProfileHideDocument = UserProfileHide & Document;
export const UserProfileHideSchema =
  SchemaFactory.createForClass(UserProfileHide);

UserProfileHideSchema.index({ userId: 1, hiddenUserId: 1 }, { unique: true });
UserProfileHideSchema.index({ hiddenUserId: 1, userId: 1 });
