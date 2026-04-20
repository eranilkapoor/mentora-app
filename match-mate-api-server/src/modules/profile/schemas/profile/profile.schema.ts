import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import {
  Caste,
  Diet,
  Drinking,
  Gender,
  MaritalStatus,
  ProfileStatus,
  Religion,
  Smoking,
} from 'src/common/enums';
import { Education } from './education.schema';
import { Physical } from './physical.schema';
import { Personal } from './personal.schema';
import { Family } from './family.schema';

@Schema({ _id: false })
class GeoLocation {
  @Prop({ type: String, enum: ['Point'], required: true, default: 'Point' })
  type!: 'Point';

  @Prop({
    type: [Number],
    required: true,
    index: '2dsphere',
  })
  coordinates!: [number, number]; // [longitude, latitude]
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
class PartnerPreference {
  @Prop({ type: AgeRange })
  ageRange?: AgeRange;

  @Prop({ type: HeightRange })
  heightRange?: HeightRange;

  @Prop({ type: [String], enum: MaritalStatus, default: [] })
  maritalStatus?: MaritalStatus[];

  @Prop({ type: [String], default: [] })
  religion?: string[];

  @Prop({ type: [String], default: [] })
  caste?: string[];

  @Prop({ type: [String], default: [] })
  country?: string[];

  @Prop({ type: [String], default: [] })
  state?: string[];

  @Prop({ type: [String], default: [] })
  city?: string[];

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
  aboutPartner?: string;

  @Prop({ default: false })
  isStrict!: boolean;
}

@Schema({ _id: false })
class Preferences {
  @Prop({ type: PartnerPreference, default: () => ({}) })
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

  @Prop()
  filename?: string;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: Date.now })
  uploadedAt!: Date;
}

@Schema({ _id: true, timestamps: true })
class ProfileVideo {
  @Prop({ required: true })
  url!: string;

  @Prop()
  filename?: string;

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

  @Prop({ default: Date.now })
  uploadedAt!: Date;
}

@Schema({ collection: COLLECTIONS.PROFILE, timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  profileFor!: string;

  @Prop({ type: Personal, required: true })
  personal!: Personal;

  @Prop({ type: Physical, required: true })
  physical!: Physical;

  @Prop({ type: Education, required: true })
  education!: Education;

  @Prop({ type: Family })
  family?: Family;

  @Prop({ type: Preferences, default: () => ({ partnerPreference: {} }) })
  preferences!: Preferences;

  @Prop({ type: [ProfileImage], default: [] })
  profileImages?: ProfileImage[];

  @Prop({ type: [ProfileVideo], default: [] })
  profileVideos?: ProfileVideo[];

  @Prop({ index: true })
  age!: number;

  @Prop({ index: true })
  heightCm!: number;

  @Prop({ enum: Religion, index: true })
  religion!: Religion;

  @Prop({ enum: Caste, index: true })
  caste?: Caste;

  @Prop({ index: true })
  city?: string;

  @Prop({ type: GeoLocation })
  location?: GeoLocation;

  @Prop({ enum: Gender, index: true })
  gender!: Gender;

  @Prop({ default: 0, index: true })
  profileScore!: number;

  @Prop({ default: 0 })
  profileCompletionPercentage!: number;

  @Prop({ type: [String], index: true })
  searchTags?: string[];

  @Prop({ type: [String], default: [] })
  aiTags?: string[];

  @Prop({ default: false, index: true })
  isPremium!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  hideContactDetails!: boolean;

  @Prop({ default: false })
  hidePhotos!: boolean;

  @Prop({ default: false })
  showOnlyToPaidUsers!: boolean;

  @Prop({ default: false })
  isProfileLocked!: boolean;

  @Prop({
    type: String,
    enum: ProfileStatus,
    default: ProfileStatus.DRAFT,
    index: true,
  })
  status!: ProfileStatus;

  @Prop({ index: true })
  lastActiveAt!: Date;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export type ProfileDocument = Profile & Document;
export const ProfileSchema = SchemaFactory.createForClass(Profile);

ProfileSchema.index({
  gender: 1,
  age: 1,
  religion: 1,
  caste: 1,
  city: 1,
  status: 1,
});
ProfileSchema.index({
  isPremium: 1,
  lastActiveAt: -1,
  profileScore: -1,
});
ProfileSchema.index({ location: '2dsphere' });
