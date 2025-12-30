import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS, STATUS } from './../../../common/constants';

/* ---------------- SUB SCHEMAS ---------------- */

@Schema({ _id: false })
class Phone {
  @Prop() countryCode: string;
  @Prop() number: string;
}

@Schema({ _id: false })
class SocialProvider {
  @Prop({ default: false }) enabled: boolean;
  @Prop() providerId?: string;
}

@Schema({ _id: false })
class AuthProviders {
  @Prop({ default: false }) email: boolean;
  @Prop({ default: false }) phone: boolean;
  @Prop({ type: SocialProvider, default: {} }) google: SocialProvider;
  @Prop({ type: SocialProvider, default: {} }) facebook: SocialProvider;
  @Prop({ type: SocialProvider, default: {} }) apple: SocialProvider;
}

/* ---------------- MAIN USER SCHEMA ---------------- */

@Schema({ collection: COLLECTIONS.USER, timestamps: true })
export class User {
  /* ---------- AUTH ---------- */
  @Prop({ lowercase: true, trim: true, unique: true, sparse: true })
  email?: string;

  @Prop({ type: Phone })
  phone?: Phone;

  @Prop()
  password_hash?: string;

  @Prop({ type: AuthProviders, default: {} })
  auth_providers: AuthProviders;

  @Prop({ default: false })
  is_email_verified: boolean;

  @Prop({ default: false })
  is_phone_verified: boolean;

  /* ---------- BASIC PROFILE ---------- */
  @Prop() first_name?: string;
  @Prop() last_name?: string;
  @Prop() gender?: string;
  @Prop() dob?: Date;

  /* ---------- MATRIMONIAL DETAILS ---------- */
  @Prop() religion?: string;
  @Prop() caste?: string;
  @Prop() language?: string;

  @Prop() country?: string;
  @Prop() state?: string;
  @Prop() city?: string;

  @Prop() education?: string;
  @Prop() profession?: string;
  @Prop() income?: string;
  @Prop() marital_status?: string;

  @Prop() height?: number;
  @Prop() weight?: number;

  /* ---------- MEDIA ---------- */
  @Prop() profile_photo?: string;
  @Prop([String]) gallery?: string[];

  /* ---------- STATUS ---------- */
  @Prop({ default: false })
  is_profile_completed: boolean;

  @Prop({ default: STATUS.PENDING })
  verification_status: string;

  @Prop({ default: false })
  is_premium: boolean;

  @Prop({ default: STATUS.ACTIVE })
  status: string;

  /* ---------- AUDIT ---------- */
  @Prop()
  last_login?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });

UserSchema.index(
  { 'phone.countryCode': 1, 'phone.number': 1 },
  { unique: true, sparse: true }
);

UserSchema.index(
  { 'auth_providers.google.providerId': 1 },
  { sparse: true }
);

UserSchema.index(
  { 'auth_providers.facebook.providerId': 1 },
  { sparse: true }
);

UserSchema.index(
  { 'auth_providers.apple.providerId': 1 },
  { sparse: true }
);
