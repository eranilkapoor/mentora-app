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
  country?: Country;

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

  @Prop({ type: [String], default: [] })
  languages?: string[];

  @Prop()
  aboutMe?: string;
}
