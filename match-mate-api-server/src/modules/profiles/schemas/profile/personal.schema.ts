import { Prop, Schema } from '@nestjs/mongoose';
import {
  Eating,
  Drinking,
  Hour,
  ManglikStatus,
  MaritalStatus,
  Minute,
  Smoking,
  TimePeriod,
  Gender,
  Religion,
  Caste,
  Country,
  PersonalityBadge,
} from '@/common/enums';

@Schema({ _id: false })
class PlaceOfBirth {
  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: Country;
}

@Schema({ _id: false })
class TimeOfBirth {
  @Prop({ enum: Hour })
  hour?: Hour;

  @Prop({ enum: Minute })
  minute?: Minute;

  @Prop({ enum: TimePeriod })
  period?: TimePeriod;
}

@Schema({ _id: false })
export class ReligiousDetails {
  @Prop({ enum: Caste })
  caste?: Caste;

  @Prop()
  subCaste?: string;

  @Prop()
  gotra?: string;

  @Prop({ enum: ManglikStatus })
  manglikStatus?: ManglikStatus;

  @Prop()
  rashi?: string;

  @Prop()
  nakshatra?: string;

  @Prop()
  kundliFileUrl?: string;

  @Prop()
  sect?: string;

  @Prop()
  subSect?: string;

  @Prop()
  community?: string;

  @Prop()
  maslak?: string;

  @Prop()
  namaazPracticing?: string;

  @Prop()
  hijabPreference?: string;

  @Prop()
  halalLifestyle?: boolean;

  @Prop()
  denomination?: string;

  @Prop()
  churchName?: string;

  @Prop()
  churchAttendance?: string;

  @Prop()
  baptismStatus?: string;

  @Prop()
  confirmationStatus?: string;

  @Prop()
  bornAgain?: boolean;

  @Prop()
  sikhCommunity?: string;

  @Prop()
  amritdhariStatus?: string;

  @Prop()
  wearsTurban?: boolean;

  @Prop()
  nativeVillage?: string;

  @Prop()
  gurudwaraName?: string;

  @Prop()
  jainSect?: string;

  @Prop()
  jainCommunity?: string;

  @Prop()
  foodStrictness?: string;

  @Prop()
  buddhistTradition?: string;

  @Prop()
  buddhistCommunity?: string;

  @Prop()
  jewishDenomination?: string;

  @Prop()
  jewishCommunity?: string;

  @Prop()
  kosherPractice?: string;

  @Prop()
  parsiCommunity?: string;

  @Prop()
  navjoteDone?: boolean;

  @Prop()
  fireTempleAssociation?: string;

  @Prop()
  otherReligionDetails?: string;
}

@Schema({ _id: false })
export class Personal {
  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName?: string;

  @Prop({ enum: Gender })
  gender!: Gender;

  @Prop({
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  })
  dateOfBirth!: string;

  @Prop({ type: TimeOfBirth })
  timeOfBirth?: TimeOfBirth;

  @Prop({ type: PlaceOfBirth })
  placeOfBirth?: PlaceOfBirth;

  @Prop({ enum: Religion })
  religion!: Religion;

  @Prop({ type: ReligiousDetails, default: {} })
  religiousDetails?: ReligiousDetails;

  @Prop()
  country?: Country;

  @Prop()
  state?: string;

  @Prop()
  city?: string;

  @Prop()
  citizenship?: string;

  @Prop({ default: false })
  isNri?: boolean;

  @Prop()
  residencyCountry?: Country;

  @Prop()
  visaStatus?: string;

  @Prop()
  abroadSince?: string;

  @Prop({ default: false })
  willingToRelocate?: boolean;

  @Prop()
  motherTongue?: string;

  @Prop({ enum: MaritalStatus, required: true })
  maritalStatus!: MaritalStatus;

  @Prop({ default: false })
  hasChildren?: boolean;

  @Prop()
  sonsCount?: number;

  @Prop()
  daughtersCount?: number;

  @Prop({ enum: Smoking })
  smoking?: Smoking;

  @Prop({ enum: Drinking })
  drinking?: Drinking;

  @Prop({ enum: Eating })
  eating?: Eating;

  @Prop({ type: [String], default: [] })
  hobbies?: string[];

  @Prop({ type: [String], enum: PersonalityBadge, default: [] })
  personalityBadges?: PersonalityBadge[];

  @Prop({ type: [String], default: [] })
  languages?: string[];

  @Prop()
  aboutMe?: string;
}
