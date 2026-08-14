import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.AI_SETTING, timestamps: true })
export class AiSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ default: true }) aiRecommendationsEnabled!: boolean;
  @Prop({ default: true }) adaptiveTutorRanking!: boolean;
  @Prop({ default: false }) studyPlanSuggestions!: boolean;
  @Prop({ default: true }) progressScoring!: boolean;
  @Prop({ default: false }) allowAiProfileSummary!: boolean;
  @Prop({ default: true }) useProfileDataForPersonalization!: boolean;
}

export type AiSettingDocument = AiSetting & Document;
export const AiSettingSchema = SchemaFactory.createForClass(AiSetting);
