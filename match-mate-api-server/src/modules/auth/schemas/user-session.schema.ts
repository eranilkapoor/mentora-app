import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.USER_SESSION, timestamps: true })
export class UserSession {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  refreshToken!: string;

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

UserSessionSchema.index({ refreshToken: 1 });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
