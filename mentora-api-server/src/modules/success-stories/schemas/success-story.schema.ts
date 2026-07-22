import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import {
  SUCCESS_STORY_STATUSES,
  SuccessStoryStatus,
} from '../success-story.constants';

@Schema({ collection: COLLECTION_NAMES.SUCCESS_STORY, timestamps: true })
export class SuccessStory {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title!: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  story!: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  partnerName!: string;

  @Prop({ type: Date, required: true })
  marriageDate!: Date;

  @Prop({ trim: true, maxlength: 120 })
  location?: string;

  @Prop({ type: [String], default: [] })
  photoUrls!: string[];

  @Prop({ required: true, default: false })
  publicationConsent!: boolean;

  @Prop({ type: String, enum: SUCCESS_STORY_STATUSES, default: 'submitted' })
  status!: SuccessStoryStatus;

  @Prop({ type: Types.ObjectId })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  rejectionReason?: string;

  @Prop()
  publishedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type SuccessStoryDocument = SuccessStory & Document;
export const SuccessStorySchema = SchemaFactory.createForClass(SuccessStory);

SuccessStorySchema.index({ status: 1, publishedAt: -1 });
SuccessStorySchema.index({ userId: 1, createdAt: -1 });
