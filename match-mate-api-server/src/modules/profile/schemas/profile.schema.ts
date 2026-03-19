import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';

@Schema({ collection: COLLECTIONS.PROFILE, timestamps: true })
export class Profile {
  @Prop({ 
    type: Types.ObjectId, 
    required: true, 
    unique: true 
  })
  userId: Types.ObjectId;

  @Prop()
  profileFor: string;

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
  weightKg: number;

  @Prop()
  religion: string;

  @Prop()
  caste: string;

  @Prop()
  country: string;

  @Prop()
  state: string;

  @Prop()
  city: string;

  @Prop()
  motherTongue: string;

  @Prop({ enum: MaritalStatus })
  maritalStatus: MaritalStatus;

  @Prop()
  education: string;

  @Prop()
  fieldOfEducation: string;

  @Prop()
  college: string;

  @Prop()
  occupation: string;

  @Prop()
  annualIncome: string;

  @Prop()
  location: string;

  @Prop()
  aboutMe: string;

  @Prop()
  bodyType: string;

  @Prop()
  complexion: string;

  @Prop()
  bloodGroup: string;

  @Prop()
  fatherName: string;

  @Prop()
  motherName: string;

  @Prop()
  fatherOccupation: string;

  @Prop()
  motherOccupation: string;

  @Prop()
  familyType: string;

  @Prop()
  familyStatus: string;

  @Prop()
  familyValues: string;

  @Prop()
  siblings: string;

  @Prop()
  partnerPreference: string;

  @Prop()
  hobbies: string;

  @Prop()
  interests: string;

  @Prop()
  music: string;

  @Prop()
  movies: string;

  @Prop()
  sports: string;

  @Prop()
  food: string;

  @Prop()
  languagesKnown: string;

  @Prop({ default: true })
  isActive: boolean;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({ religion: 1, caste: 1 });
