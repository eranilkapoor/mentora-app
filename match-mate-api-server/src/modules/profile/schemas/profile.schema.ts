import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  NEVER_MARRIED = 'NEVER_MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ enum: Gender })
  gender: Gender;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  heightCm: number;

  @Prop()
  religion: string;

  @Prop()
  caste: string;

  @Prop()
  motherTongue: string;

  @Prop({ enum: MaritalStatus })
  maritalStatus: MaritalStatus;

  @Prop()
  education: string;

  @Prop()
  occupation: string;

  @Prop()
  annualIncome: string;

  @Prop()
  location: string;

  @Prop()
  aboutMe: string;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({ religion: 1, caste: 1 });