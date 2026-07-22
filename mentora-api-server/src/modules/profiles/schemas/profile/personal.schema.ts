import { Prop, Schema } from '@nestjs/mongoose';
import {
  Gender,
  Religion,
  Caste,
  Country,
  PersonalityBadge,
} from '@/common/enums';

@Schema({ _id: false })
export class ReligiousDetails {
  @Prop({ enum: Caste })
  caste?: Caste;

  @Prop()
  subCaste?: string;

  @Prop()
  gotra?: string;

  @Prop()
  rashi?: string;

  @Prop()
  nakshatra?: string;

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

  @Prop({ type: [String], default: [] })
  hobbies?: string[];

  @Prop({ type: [String], enum: PersonalityBadge, default: [] })
  personalityBadges?: PersonalityBadge[];

  @Prop({ type: [String], default: [] })
  languages?: string[];

  @Prop()
  aboutMe?: string;
}
