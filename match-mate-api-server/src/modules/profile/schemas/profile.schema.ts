import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';
import { Smoking } from '../enums/smoking.enum';
import { Drinking } from '../enums/drinking.enum';
import { Diet } from '../enums/diet.enum';

@Schema({ _id: false })
class Personal {
  @Prop({ required: true })
  profileFor: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
  religion: string;

  @Prop()
  caste?: string;

  @Prop()
  country?: string;

  @Prop()
  state?: string;

  @Prop()
  city?: string;

  @Prop()
  motherTongue?: string;

  @Prop({ enum: MaritalStatus, required: true })
  maritalStatus: MaritalStatus;

  @Prop()
  aboutMe?: string;
}

@Schema({ _id: false })
class Physical {
  @Prop({ required: true })
  height: number;

  @Prop()
  weight?: number;

  @Prop()
  bodyType?: string;

  @Prop()
  complexion?: string;
}

@Schema({ _id: false })
class Education {
  @Prop({ required: true })
  qualification: string;

  @Prop()
  field?: string;

  @Prop()
  university?: string;

  @Prop({ required: true })
  occupation: string;

  @Prop()
  annualIncome?: string;
}

@Schema({ _id: false })
class SiblingDetail {
  @Prop({ enum: ['brother', 'sister'], required: true })
  type: 'brother' | 'sister';

  @Prop({ default: false })
  married: boolean;

  @Prop()
  occupation?: string;
}

@Schema({ _id: false })
export class Siblings {
  @Prop({ default: 0 })
  brothers: number;

  @Prop({ default: 0 })
  sisters: number;

  @Prop({ default: 0 })
  marriedBrothers: number;

  @Prop({ default: 0 })
  marriedSisters: number;

  @Prop({ type: [SiblingDetail], default: [] })
  details: SiblingDetail[];

  @Prop()
  note?: string;
}

@Schema({ _id: false })
class Family {
  @Prop()
  fatherName?: string;

  @Prop()
  motherName?: string;

  @Prop()
  fatherOccupation?: string;

  @Prop()
  motherOccupation?: string;

  @Prop()
  familyType?: string;

  @Prop()
  familyStatus?: string;

  @Prop()
  familyValues?: string;

  @Prop({ type: Siblings, default: () => ({}) })
  siblings?: Siblings;
}

@Schema({ _id: false })
class AgeRange {
  @Prop()
  min: number;

  @Prop()
  max: number;
}

@Schema({ _id: false })
class HeightRange {
  @Prop()
  min: number;

  @Prop()
  max: number;
}

@Schema({ _id: false })
class IncomeRange {
  @Prop()
  min: number;

  @Prop()
  max: number;
}

@Schema({ _id: false })
export class PartnerPreference {
  @Prop({ type: AgeRange })
  ageRange?: AgeRange;

  @Prop({ type: HeightRange })
  heightRange?: HeightRange;

  @Prop({ type: [String], enum: MaritalStatus, default: [] })
  maritalStatus: MaritalStatus[];

  @Prop({ type: [String], default: [] })
  religion: string[];

  @Prop({ type: [String], default: [] })
  caste: string[];

  @Prop({ type: [String], default: [] })
  country: string[];

  @Prop({ type: [String], default: [] })
  state: string[];

  @Prop({ type: [String], default: [] })
  city: string[];

  @Prop({ type: [String], default: [] })
  qualification: string[];

  @Prop({ type: [String], default: [] })
  occupation: string[];

  @Prop({ type: IncomeRange })
  annualIncomeRange?: IncomeRange;

  @Prop({ type: [String], default: [] })
  bodyType: string[];

  @Prop({ type: [String], default: [] })
  complexion: string[];

  @Prop({ type: [String], enum: Smoking, default: [] })
  smoking: Smoking[];

  @Prop({ type: [String], enum: Drinking, default: [] })
  drinking: Drinking[];

  @Prop({ type: [String], enum: Diet, default: [] })
  diet: Diet[];

  @Prop({ type: [String], default: [] })
  languagesKnown: string[];

  @Prop()
  aboutPartner?: string;

  @Prop({ default: false })
  isStrict: boolean;
}

@Schema({ _id: false })
class Preferences {
  @Prop({ type: PartnerPreference, required: true })
  partnerPreference: PartnerPreference;

  @Prop({ type: [String], default: [] })
  hobbies: string[];

  @Prop({ type: String, enum: Smoking, default: "" })
  smoking: string;

  @Prop({ type: String, enum: Drinking, default: "" })
  drinking: string;

  @Prop({ type: String, enum: Diet, default: "" })
  diet: string;

  @Prop({ type: [String], default: [] })
  music: string[];

  @Prop({ type: [String], default: [] })
  movies: string[];

  @Prop({ type: [String], default: [] })
  sports: string[];

  @Prop({ type: [String], default: [] })
  languagesKnown: string[];
}

@Schema({ collection: COLLECTIONS.PROFILE, timestamps: true })
export class Profile {
  @Prop({ 
    type: Types.ObjectId, 
    required: true, 
    unique: true 
  })
  userId: Types.ObjectId;

  @Prop({ type: Personal, required: true })
  personal: Personal;

  @Prop({ type: Physical, required: true })
  physical: Physical;

  @Prop({ type: Education, required: true })
  education: Education;

  @Prop({ type: Family, required: true })
  family: Family;

  @Prop({ type: Preferences, required: true })
  preferences: Preferences;

  @Prop({ default: 0 })
  profileCompletionPercentage: number;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: false })
  isProfileLocked: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop( { default: false })
  isActive: boolean;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({
  userId: 1,
  profileFor: 1,
  religion: 1,
  caste: 1,
  isVerified: 1,
  isPremium: 1,
  isActive: 1,
  'preferences.partnerPreference.religion': 1
});