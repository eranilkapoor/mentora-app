import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.USER_SESSION, timestamps: true })
export class UserSession {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({ required: true, select: false })
  refreshTokenHash!: string;

  @Prop({ required: true, index: true })
  tokenFamilyId!: string;

  @Prop()
  device!: string;

  @Prop()
  ip!: string;

  @Prop()
  userAgent!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  expiresAt!: Date;

  @Prop()
  loggedOutAt?: Date;
}

export type UserSessionDocument = UserSession & Document;
export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

UserSessionSchema.index({ refreshTokenHash: 1 }, { unique: true });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
