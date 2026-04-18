import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.PRIVACY_SETTING, timestamps: true })
export class PrivacySetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop()
  profileVisibility?: 'public' | 'private' | 'contacts_only';

  @Prop({ default: false })
  hideContactDetails!: boolean;

  @Prop({ default: false })
  hidePhotos!: boolean;

  @Prop({ default: false })
  showOnlyToPremium!: boolean;

  @Prop({ enum: ['all', 'matches_only', 'contacts_only'] })
  allowMessagesFrom!: 'all' | 'matches_only' | 'contacts_only';

  @Prop({ default: true })
  showOnlineStatus!: boolean;

  @Prop({ enum: ['all', 'matches', 'none'] })
  lastSeenVisibility?: 'all' | 'matches' | 'none';

  @Prop({ default: false })
  incognitoMode!: boolean;

  @Prop({ default: 0 })
  dailyInterestLimitUsed!: number;
}

export type PrivacySettingDocument = PrivacySetting & Document;
export const PrivacySettingSchema =
  SchemaFactory.createForClass(PrivacySetting);

PrivacySettingSchema.index({ profileVisibility: 1 });
