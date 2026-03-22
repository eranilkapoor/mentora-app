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
  lastName: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true })
  dob: Date;

  @Prop({ required: true })
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

  @Prop({ enum: MaritalStatus, required: true })
  maritalStatus: MaritalStatus;

  @Prop()
  aboutMe: string;
}

@Schema({ _id: false })
class Physical {
  @Prop({ required: true })
  height: number;

  @Prop()
  weight: number;

  @Prop()
  bodyType: string;

  @Prop()
  complexion: string;
}

@Schema({ _id: false })
class Education {
  @Prop({ required: true })
  qualification: string;

  @Prop()
  field: string;

  @Prop()
  university: string;

  @Prop({ required: true })
  occupation: string;

  @Prop()
  annualIncome: string;
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
  /* SUMMARY COUNTS */
  @Prop({ default: 0 })
  brothers: number;

  @Prop({ default: 0 })
  sisters: number;

  @Prop({ default: 0 })
  marriedBrothers: number;

  @Prop({ default: 0 })
  marriedSisters: number;

  /* OPTIONAL DETAILS */
  @Prop({ type: [SiblingDetail], default: [] })
  details: SiblingDetail[];

  /* FLEXIBLE TEXT (fallback) */
  @Prop()
  note?: string; // e.g. "1 elder brother, married"
}

@Schema({ _id: false })
class Family {
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

  @Prop({ type: Siblings, default: () => ({}) })
  siblings: Siblings;
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
  ageRange: AgeRange;

  @Prop({ type: HeightRange })
  heightRange: HeightRange;

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
  annualIncomeRange: IncomeRange;

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
  aboutPartner: string;

  @Prop({ default: false })
  isStrict: boolean;
}

/* PREFERENCES */
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

/* MAIN PROFILE */
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

/*
First Name : Required, String
Last Name : Optional, String
Gender : Required
Date of Birth : Required, Date
Marital Status (Single/Divorced/Widowed) : Optional, Enum
Religion : Optional, String
Caste : Optional, String
Country : Optional, String
State : Optional, String
City : Optional, String
Mother Tongue : Optional, String
About Me : Optional, String
Height (cm) : Required, Number
Weight (kg) : Optional, Number
Body Type (Slim/Athletic/Average/Heavy) : Optional, String
Complexion  (Fair/Wheatish/Dark) : Optional, String
Qualification (High School/Graduate/Postgraduate/Doctorate) : Optional, String
Field of Study : Optional, String
University/College : Optional, String
Occupation : Optional, String
Annual Income : Optional, Number
Father's Name : Required, String
Mother's Name : Optional, String
Father's Occupation : Optional, String
Mother's Occupation : Optional, String
Family Type (Joint/Nuclear) : Optional, String
Family Status (Middle Class/Upper Middle Class/Rich) : Optional, String
Family Values (Traditional/Moderate/Liberal) : Optional, String
Siblings (Number of Brothers/Sisters) : Optional, String

Partner Preferences:
- Age Range : Optional, Object { min: Number, max: Number }
- Height Range (cm) : Optional, Object { min: Number, max: Number }
- Marital Status : Optional, Array of Enum (Single, Divorced)
- Religion : Optional, Array of String
- Caste : Optional, Array of String
- Country : Optional, Array of String
- State : Optional, Array of String
- City : Optional, Array of String
- Qualification : Optional, Array of String
- Occupation : Optional, Array of String
- Income Range : Optional, Object { min: Number, max: Number }
- Body Type : Optional, Array of String
- Complexion : Optional, Array of String
- Diet : Optional, Array of String (Vegetarian/Non-Vegetarian/Eggetarian)
- Smoking Habits : Optional, Array of String (Non-Smoker/Smoker)
- Drinking Habits : Optional, Array of String (Non-Drinker/Drinker)
- Languages Known : Optional, Array of String
- About Partner : Optional, String
- Is Strict : Optional, Boolean (true for strict filter, false for flexible match)

Hobbies : Optional, Array of String
Interests : Optional, Array of String
Music : Optional, Array of String
Movies : Optional, Array of String
Sports : Optional, Array of String
Food : Optional, Array of String
Languages Known : Optional, Array of String

Profile Completion Percentage : Number (0 to 100)
Is Verified : Boolean
Is Premium : Boolean
Is Profile Locked : Boolean
Is Deleted : Boolean
Is Active : Boolean 
*/