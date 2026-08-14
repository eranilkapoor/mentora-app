import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  ProfileVisibility,
  VisibilityLevel,
} from '../enums/settings-preferences.enums';

@Schema({ collection: COLLECTION_NAMES.PRIVACY_SETTING, timestamps: true })
export class PrivacySetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  //  Profile visibility
  @Prop({
    type: String,
    enum: ProfileVisibility,
    default: ProfileVisibility.PUBLIC,
  })
  profileVisibility!: ProfileVisibility;

  @Prop({ default: false }) incognitoMode!: boolean;
  @Prop({ default: false }) showOnlyToPremium!: boolean;

  //  Contact & Personal info
  @Prop({ default: false }) showPhone!: boolean;
  @Prop({ default: false }) showEmail!: boolean;
  @Prop({ default: false }) showIncome!: boolean;
  @Prop({ default: false }) showExactAge!: boolean;

  @Prop({ default: true }) parentCanViewProgress!: boolean;
  @Prop({ default: false }) parentCanViewDetailedAiChats!: boolean;
  @Prop({ default: true }) showLearningActivityToGuardians!: boolean;
  @Prop({ default: false }) allowTutorProfileDiscovery!: boolean;

  //  Media
  @Prop({
    type: String,
    enum: VisibilityLevel,
    default: VisibilityLevel.EVERYONE,
  })
  showPhotosTo!: VisibilityLevel;

  @Prop({ default: false }) blurPhotosForUnmatched!: boolean;
  @Prop({ default: true }) allowScreenshots!: boolean;

  //  Online presence
  @Prop({ default: true }) showOnlineStatus!: boolean;
  @Prop({
    type: String,
    enum: VisibilityLevel,
    default: VisibilityLevel.EVERYONE,
  })
  showLastSeen!: VisibilityLevel;
}

export type PrivacySettingDocument = PrivacySetting & Document;
export const PrivacySettingSchema =
  SchemaFactory.createForClass(PrivacySetting);

PrivacySettingSchema.index({ profileVisibility: 1 });
PrivacySettingSchema.index({ parentCanViewProgress: 1 });
