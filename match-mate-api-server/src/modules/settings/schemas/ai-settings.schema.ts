import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.AI_SETTING, timestamps: true })
export class AiSettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: true }) aiRecommendationsEnabled!: boolean;
  @Prop({ default: true }) smartMatchRanking!: boolean;
  @Prop({ default: false }) horoscopeSuggestions!: boolean;
  @Prop({ default: true }) compatibilityScoring!: boolean;
  @Prop({ default: false }) allowAiBioGeneration!: boolean;
  @Prop({ default: true }) useProfileDataForRanking!: boolean;
}

export type AiSettingsDocument = AiSettings & Document;
export const AiSettingsSchema = SchemaFactory.createForClass(AiSettings);
