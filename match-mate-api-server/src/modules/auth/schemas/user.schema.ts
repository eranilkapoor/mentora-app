import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ unique: true }) email?: string;
  @Prop() phone?: string;
  @Prop() password?: string;
  @Prop({ enum: ['email', 'google', 'facebook', 'instagram', 'phone'] })
  provider?: string;
  @Prop() providerId?: string;
  @Prop() refreshToken?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
