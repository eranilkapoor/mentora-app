import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Match extends Document {
  @Prop({ type: [Types.ObjectId], required: true })
  users: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

MatchSchema.index({ users: 1 }, { unique: true });
