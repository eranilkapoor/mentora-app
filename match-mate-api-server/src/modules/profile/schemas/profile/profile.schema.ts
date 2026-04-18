import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import { Caste, Gender, ProfileStatus, Religion } from 'src/common/enums';
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
