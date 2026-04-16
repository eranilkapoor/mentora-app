import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.ANALYTICS, timestamps: true })
export class Analytics {
  @Prop({ type: Types.ObjectId, unique: true, required: true })
  userId!: Types.ObjectId;

  @Prop({ default: 0 })
  profileViewsCount!: number;

  @Prop({ default: 0 })
  interestsSent!: number;

  @Prop({ default: 0 })
  interestsReceived!: number;
}

export type AnalyticsDocument = Analytics & Document;
export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);