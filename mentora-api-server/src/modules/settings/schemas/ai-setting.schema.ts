import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

@Schema({ collection: COLLECTION_NAMES.AI_SETTING, timestamps: true })
export class AiSetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: true }) aiRecommendationsEnabled!: boolean;
  @Prop({ default: true }) smartMatchRanking!: boolean;
  @Prop({ default: false }) horoscopeSuggestions!: boolean;
  @Prop({ default: true }) compatibilityScoring!: boolean;
  @Prop({ default: false }) allowAiBioGeneration!: boolean;
  @Prop({ default: true }) useProfileDataForRanking!: boolean;
}

export type AiSettingDocument = AiSetting & Document;
export const AiSettingSchema = SchemaFactory.createForClass(AiSetting);
