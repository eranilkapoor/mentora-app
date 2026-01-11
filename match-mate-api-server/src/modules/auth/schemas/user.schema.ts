import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS, STATUS } from './../../../common/constants';

@Schema({ collection: COLLECTIONS.USER, timestamps: true })
export class User {
  @Prop({ required: true }) first_name: string;
  @Prop() last_name: string;
  @Prop() gender?: string;
  @Prop() dob?: Date;
  @Prop({ unique: true, sparse: true }) email?: string;
  @Prop() phone?: string;
  @Prop() password_hash?: string;
  @Prop() provider?: string;
  @Prop() providerId?: string;
  @Prop() religion?: string;
  @Prop() caste?: string;
  @Prop() language?: string;
  @Prop() country?: string;
  @Prop() state?: string;
  @Prop() city?: string;
  @Prop() education?: string;
  @Prop() profession?: string;
  @Prop() income?: string;
  @Prop() marital_status?: string;
  @Prop() height?: number;
  @Prop() weight?: number;
  @Prop() profile_photo?: string;
  @Prop([String]) gallery?: string[];
  @Prop({ default: STATUS.PENDING }) verification_status?: string;
  @Prop({ default: false }) is_premium?: boolean;
  @Prop() last_login?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);