import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { ProfileFor, ProfileStatus } from 'src/common/enums';
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
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ enum: ProfileFor, required: true })
  profileFor!: ProfileFor;

  @Prop({ type: Personal, required: true })
  personal!: Personal;

  @Prop({ type: Physical, required: true })
  physical!: Physical;

  @Prop({ type: Education, required: true })
  education!: Education;

  @Prop({ type: Family })
  family?: Family;

  @Prop()
  age!: number;

  @Prop({ type: GeoLocation })
  location?: GeoLocation;

  @Prop({ default: 0 })
  profileScore!: number;

  @Prop({ default: 0 })
  profileCompletionPercentage!: number;

  @Prop({ type: [String], index: true })
  searchTags?: string[];

  @Prop({ type: [String], default: [] })
  aiTags?: string[];

  @Prop({ default: false })
  isPremium!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({
    type: String,
    enum: ProfileStatus,
    default: ProfileStatus.DRAFT,
  })
  status!: ProfileStatus;

  @Prop()
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
  age: 1,
  status: 1,
});
ProfileSchema.index({
  isPremium: 1,
  lastActiveAt: -1,
  profileScore: -1,
});
ProfileSchema.index({ location: '2dsphere' });
