import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS, STATUS } from '../../common/constants';

@Schema({ collection: COLLECTIONS.USER, timestamps: true })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop() phone?: string;
  @Prop({ required: true }) password: string;
  @Prop({ default: STATUS.ACTIVE }) status: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);