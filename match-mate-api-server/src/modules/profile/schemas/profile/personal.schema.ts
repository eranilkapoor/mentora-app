import { Prop, Schema } from '@nestjs/mongoose';
import { Diet, Drinking, ManglikStatus, MaritalStatus, Smoking, TimePeriod } from 'src/common/enums';

@Schema({ _id: false })
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

  @Prop({ enum: TimePeriod })
  period?: TimePeriod;
}

@Schema({ _id: false })
export class Personal {
  @Prop({ required: true })
  firstName!: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop({ type: TimeOfBirth })
  timeOfBirth?: TimeOfBirth;

  @Prop({ type: PlaceOfBirth })
  placeOfBirth?: PlaceOfBirth;

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

  @Prop({ enum: Smoking })
  smoking?: Smoking;

  @Prop({ enum: Drinking })
  drinking?: Drinking;

  @Prop({ enum: Diet })
  diet?: Diet;

  @Prop({ type: [String], default: [] })
  hobbies?: string[];

  @Prop({ type: [String], default: [] })
  languages?: string[];

  @Prop()
  aboutMe?: string;
}
