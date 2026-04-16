import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import { Caste, Diet, Drinking, Gender, ManglikStatus, MaritalStatus, Religion, Smoking } from 'src/common/enums';

class PlaceOfBirth {
  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: string;
}
@Schema({ _id: false })
class TimeOfBirth {
  @Prop({ min: 1, max: 12 })
  hour?: number;

  @Prop({ min: 0, max: 59 })
  minute?: number;

  @Prop({ enum: ['AM', 'PM'] })
  period?: 'AM' | 'PM';
}

@Schema({ _id: false })
class Personal {
  @Prop({ required: true })
  profileFor!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, enum: Gender })
  gender!: Gender;

  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop()
  age?: number; 

  @Prop()
  timeOfBirth?: TimeOfBirth;

  @Prop({ type: PlaceOfBirth })
  placeOfBirth?: PlaceOfBirth;

  @Prop({ enum: Religion, required: true })
  religion!: Religion;

  @Prop({ enum: Caste })
  caste?: Caste;

  @Prop()
  subCast?: string;

  @Prop()
  gotra?: string;

  @Prop({ enum: ManglikStatus, default: ManglikStatus.NON_MANGLIK })
  manglikStatus?: ManglikStatus;

  @Prop()
  rashi?: string;

  @Prop()
  nakshatra?: string;

  @Prop()
  kundliFileUrl?: string;

  @Prop()
  country?: string;

  @Prop()
  state?: string;

  @Prop()
  city?: string;

  @Prop()
  citizenship?: string;

  @Prop({ default: false })
  willingToRelocate?: boolean;

  @Prop()
  motherTongue?: string;

  @Prop({ enum: MaritalStatus, required: true })
  maritalStatus!: MaritalStatus;

  @Prop({ default: false })
  hasChildren?: boolean;

  @Prop()
  sonsCount? : number;

  @Prop()
  daughtersCount?: number;

  @Prop()
  aboutMe?: string;
}

@Schema({ _id: false })
class Physical {
  @Prop({ required: true })
  heightCm!: number;

  @Prop()
  heightLabel?: string;

  @Prop()
  weight?: number;

  @Prop()
  bloodGroup?: string;

  @Prop()
  bodyType?: string;

  @Prop()
  complexion?: string;

  @Prop({ default: false })
  disabilityStatus?: boolean;

  @Prop()
  disabilityNote?: string;
}

@Schema({ _id: false })
class Education {
  @Prop({ required: true })
  qualification!: string;

  @Prop()
  field?: string;

  @Prop()
  university?: string;

  @Prop()
  occupationType?: string;

  @Prop({ required: true })
  occupation!: string;

  @Prop()
  companyName?: string;

  @Prop()
  jobRole?: string;

  @Prop()
  annualIncome?: number;
}

@Schema({ _id: false })
class SiblingDetail {
  @Prop({ enum: ['brother', 'sister'], required: true })
  type!: 'brother' | 'sister';

  @Prop({ default: false })
  married!: boolean;

  @Prop()
  occupation?: string;
}

@Schema({ _id: false })
export class Siblings {
  @Prop({ default: 0 })
  brothers!: number;

  @Prop({ default: 0 })
  sisters!: number;

  @Prop({ default: 0 })
  marriedBrothers!: number;

  @Prop({ default: 0 })
  marriedSisters!: number;

  @Prop({ type: [SiblingDetail], default: [] })
  details!: SiblingDetail[];

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
  min!: number;

  @Prop()
  max!: number;
}

@Schema({ _id: false })
class HeightRange {
  @Prop()
  min!: number;

  @Prop()
  max!: number;
}

@Schema({ _id: false })
class IncomeRange {
  @Prop()
  min!: number;

  @Prop()
  max!: number;
}

@Schema({ _id: false })
export class PartnerPreference {
  @Prop({ type: AgeRange })
  ageRange?: AgeRange;

  @Prop({ type: HeightRange })
  heightRange?: HeightRange;

  @Prop({ type: [String], enum: MaritalStatus, default: [] })
  maritalStatus?: MaritalStatus[];

  @Prop()
  childPreference?: string;

  @Prop({ type: [String], default: [] })
  religion?: string[];

  @Prop({ type: [String], default: [] })
  caste?: string[];

  @Prop({ type: [String], default: [] })
  subCaste?: string[];

  @Prop()
  manglikPreference?: string;

  @Prop({ type: [String], default: [] })
  country?: string[];

  @Prop({ type: [String], default: [] })
  state?: string[];

  @Prop({ type: [String], default: [] })
  city?: string[];

  @Prop()
  nriPreference?: string;

  @Prop({ type: [String], default: [] })
  qualification?: string[];

  @Prop({ type: [String], default: [] })
  occupation?: string[];

  @Prop({ type: IncomeRange })
  annualIncomeRange?: IncomeRange;

  @Prop({ type: [String], default: [] })
  bodyType?: string[];

  @Prop({ type: [String], default: [] })
  complexion?: string[];

  @Prop({ type: [String], enum: Smoking, default: [] })
  smoking?: Smoking[];

  @Prop({ type: [String], enum: Drinking, default: [] })
  drinking?: Drinking[];

  @Prop({ type: [String], enum: Diet, default: [] })
  diet?: Diet[];

  @Prop({ type: [String], default: [] })
  languagesKnown?: string[];

  @Prop()
  horoscopeMatchRequired?: string;

  @Prop()
  isProfileVerificationRequired?: string;

  @Prop()
  aboutPartner?: string;

  @Prop({ default: false })
  isStrict!: boolean;
}

@Schema({ _id: false })
class Preferences {
  @Prop({ type: PartnerPreference, required: true })
  partnerPreference!: PartnerPreference;

  @Prop({ type: [String], default: [] })
  hobbies?: string[];

  @Prop({ enum: Smoking })
  smoking?: Smoking;

  @Prop({ enum: Drinking })
  drinking?: Drinking;

  @Prop({ enum: Diet })
  diet?: Diet;

  @Prop({ type: [String], default: [] })
  music?: string[];

  @Prop({ type: [String], default: [] })
  movies?: string[];

  @Prop({ type: [String], default: [] })
  sports?: string[];

  @Prop({ type: [String], default: [] })
  languagesKnown?: string[];
}

@Schema({ _id: true, timestamps: true })
class ProfileImage {
  @Prop({ required: true })
  url!: string;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ default: true })
  isActive!: boolean;
}

@Schema({ _id: true, timestamps: true })
class ProfileVideo {
  @Prop({ required: true })
  url!: string;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  size?: number;

  @Prop()
  mimeType?: string;
}

@Schema({ collection: COLLECTIONS.PROFILE, timestamps: true })
export class Profile {
  @Prop({
    type: Types.ObjectId,
    required: true,
    unique: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: Personal, required: true })
  personal!: Personal;

  @Prop({ type: Physical, required: true })
  physical!: Physical;

  @Prop({ type: Education, required: true })
  education!: Education;

  @Prop({ type: Family, required: true })
  family!: Family;

  @Prop({ type: Preferences, required: true })
  preferences!: Preferences;

  @Prop({ type: [ProfileImage], default: [] })
  profileImages?: ProfileImage[];

  @Prop({ type: [ProfileVideo], default: [] })
  profileVideos?: ProfileVideo[];

  @Prop({ default: 0 })
  profileCompletionPercentage!: number;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isPremium!: boolean;

  @Prop({ default: 0 })
  profileScore!: number;

  @Prop({ default: 'free' })
  membershipPlan!: string;

  @Prop({ default: false })
  hideContactDetails!: boolean;

  @Prop({ default: false })
  hidePhotos!: boolean;

  @Prop({ default: false })
  showOnlyToPaidUsers!: boolean;

  @Prop({ default: false })
  isProfileLocked!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ default: 0 })
  profileViewsCount!: number;

  @Prop({ default: 0 })
  interestsSent!: number;

  @Prop({ default: 0 })
  interestsReceived!: number;

  @Prop({ type: [String], index: true })
  searchTags?: string[];

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({
  userId: 1,
  'personal.profileFor': 1,
  'personal.religion': 1,
  'personal.caste': 1,
  isVerified: 1,
  isPremium: 1,
  isActive: 1,
  'preferences.partnerPreference.religion': 1,
});