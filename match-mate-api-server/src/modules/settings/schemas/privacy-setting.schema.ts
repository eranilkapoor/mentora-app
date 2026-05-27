import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

export type VisibilityLevel =
  | 'everyone'
  | 'accepted_matches'
  | 'contacts_only'
  | 'no_one';

@Schema({ collection: COLLECTION_NAMES.PRIVACY_SETTING, timestamps: true })
export class PrivacySetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  //  Profile visibility
  @Prop({
    type: String,
    enum: ['public', 'private', 'contacts_only', 'premium_only'],
    default: 'public',
  })
  profileVisibility!: string;

  @Prop({ default: false }) incognitoMode!: boolean;
  @Prop({ default: false }) showOnlyToPremium!: boolean;

  //  Contact & Personal info
  @Prop({ default: false }) showPhone!: boolean;
  @Prop({ default: false }) showEmail!: boolean;
  @Prop({ default: false }) showIncome!: boolean;
  @Prop({ default: false }) showExactAge!: boolean;

  //  Media
  @Prop({
    type: String,
    enum: ['everyone', 'accepted_matches', 'contacts_only', 'no_one'],
    default: 'everyone',
  })
  showPhotosTo!: VisibilityLevel;

  @Prop({ default: false }) blurPhotosForUnmatched!: boolean;
  @Prop({ default: true }) allowScreenshots!: boolean;

  //  Online presence
  @Prop({ default: true }) showOnlineStatus!: boolean;
  @Prop({
    type: String,
    enum: ['everyone', 'accepted_matches', 'contacts_only', 'no_one'],
    default: 'everyone',
  })
  showLastSeen!: VisibilityLevel;
}

export type PrivacySettingDocument = PrivacySetting & Document;
export const PrivacySettingSchema =
  SchemaFactory.createForClass(PrivacySetting);

PrivacySettingSchema.index({ profileVisibility: 1 });
