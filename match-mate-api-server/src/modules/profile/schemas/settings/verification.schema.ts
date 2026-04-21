import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ collection: COLLECTIONS.VERIFICATION, timestamps: true })
export class Verification {
  @Prop({ type: Types.ObjectId, required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop()
  idProofUrl?: string;

  @Prop()
  selfieUrl?: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isPhoneVerified?: boolean;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ default: false })
  isProfileVerified?: boolean;

  @Prop()
  verifiedAt?: Date;
}

export type VerificationDocument = Verification & Document;
export const VerificationSchema = SchemaFactory.createForClass(Verification);
