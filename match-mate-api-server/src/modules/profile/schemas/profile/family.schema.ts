import { Prop, Schema } from '@nestjs/mongoose';
import {
  FamilyStatus,
  FamilyType,
  FamilyValue,
  SiblingType,
} from 'src/common/enums';

@Schema({ _id: false })
class SiblingDetail {
  @Prop({ enum: SiblingType, required: true })
  type!: SiblingType;

  @Prop({ default: false })
  married!: boolean;

  @Prop()
  occupation?: string;
}

@Schema({ _id: false })
export class Siblings {
  @Prop({ default: 0 })
  brothersCount!: number;

  @Prop({ default: 0 })
  sistersCount!: number;

  @Prop({ default: 0 })
  marriedBrothersCount!: number;

  @Prop({ default: 0 })
  marriedSistersCount!: number;

  @Prop({ type: [SiblingDetail], default: [] })
  details!: SiblingDetail[];

  @Prop()
  note?: string;
}

@Schema({ _id: false })
export class Family {
  @Prop()
  fatherName?: string;

  @Prop()
  motherName?: string;

  @Prop()
  fatherOccupation?: string;

  @Prop()
  motherOccupation?: string;

  @Prop({ enum: FamilyType })
  familyType?: FamilyType;

  @Prop({ enum: FamilyStatus })
  familyStatus?: FamilyStatus;

  @Prop({ enum: FamilyValue })
  familyValues?: FamilyValue;

  @Prop({ type: Siblings, default: () => ({}) })
  siblings?: Siblings;
}
