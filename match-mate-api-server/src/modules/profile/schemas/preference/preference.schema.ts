import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import {
  BodyType,
  Caste,
  ChildPreference,
  Complexion,
  Diet,
  Drinking,
  ManglikStatus,
  MaritalStatus,
  OccupationType,
  Religion,
  ResidencyPreference,
  Smoking,
} from 'src/common/enums';

@Schema({ _id: false })
class Range<T = number> {
  @Prop({ type: Number, required: true })
  min!: T;

  @Prop({ type: Number, required: true })
  max!: T;
}

@Schema({ _id: false })
export class PartnerFilters {
  @Prop({ type: Range })
  age?: Range;

  @Prop({ type: Range })
  heightCm?: Range;

  @Prop({ type: Range })
  annualIncome?: Range;

  @Prop({ type: [String], enum: MaritalStatus, default: [] })
  maritalStatus?: MaritalStatus[];

  @Prop({ type: [String], enum: Religion, default: [] })
  religion?: Religion[];

  @Prop({ type: [String], enum: Caste, default: [] })
  caste?: Caste[];

  @Prop({ type: [String], default: [] })
  subCaste?: string[];

  @Prop({ type: [String], enum: ManglikStatus, default: [] })
  manglikStatus?: ManglikStatus[];

  @Prop({ enum: ChildPreference, default: ChildPreference.DOES_NOT_MATTER })
  childPreference!: ChildPreference;

  @Prop({
    enum: ResidencyPreference,
    default: ResidencyPreference.DOES_NOT_MATTER,
  })
  residencyPreference!: ResidencyPreference;

  @Prop({ type: [String], default: [] })
  country?: string[];

  @Prop({ type: [String], default: [] })
  state?: string[];

  @Prop({ type: [String], default: [] })
  city?: string[];

  @Prop({ type: [String], default: [] })
  qualification?: string[];

  @Prop({ type: [String], enum: OccupationType, default: [] })
  occupationType?: OccupationType[];

  @Prop({ type: [String], default: [] })
  occupation?: string[];

  @Prop({ type: [String], enum: BodyType, default: [] })
  bodyType?: BodyType[];

  @Prop({ type: [String], enum: Complexion, default: [] })
  complexion?: Complexion[];

  @Prop({ type: [String], enum: Smoking, default: [] })
  smoking?: Smoking[];

  @Prop({ type: [String], enum: Drinking, default: [] })
  drinking?: Drinking[];

  @Prop({ type: [String], enum: Diet, default: [] })
  diet?: Diet[];

  @Prop({ type: [String], default: [] })
  languages?: string[];
}

@Schema({ _id: false })
class MatchSettings {
  @Prop({ type: Boolean, default: false })
  isStrict!: boolean;

  @Prop({ type: Boolean, default: true })
  allowPartialMatches!: boolean;

  @Prop({ type: Boolean, default: false })
  horoscopeRequired!: boolean;

  @Prop({ type: Boolean, default: false })
  profileVerificationRequired!: boolean;

  @Prop({ type: Number, default: 50 })
  minimumMatchScore!: number;
}

@Schema({ _id: false })
class MatchWeights {
  @Prop({ type: Number, default: 10 }) age!: number;
  @Prop({ type: Number, default: 10 }) height!: number;
  @Prop({ type: Number, default: 15 }) religion!: number;
  @Prop({ type: Number, default: 10 }) caste!: number;
  @Prop({ type: Number, default: 10 }) location!: number;
  @Prop({ type: Number, default: 10 }) education!: number;
  @Prop({ type: Number, default: 10 }) occupation!: number;
  @Prop({ type: Number, default: 10 }) lifestyle!: number;
  @Prop({ type: Number, default: 15 }) horoscope!: number;
}

@Schema({ collection: COLLECTIONS.PREFERENCE, timestamps: true })
export class Preference {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: PartnerFilters, required: true })
  filters!: PartnerFilters;

  @Prop({ type: MatchSettings, default: () => ({}) })
  settings!: MatchSettings;

  @Prop({ type: MatchWeights, default: () => ({}) })
  weights!: MatchWeights;

  @Prop({ type: String })
  aboutPartner?: string;

  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;
}

export type PreferenceDocument = Preference & Document;
export const PreferenceSchema = SchemaFactory.createForClass(Preference);
