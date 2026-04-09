import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants';
import { AuthProvider } from '../enums/auth-provider.enum';
import { UserStatus } from '../enums/user-status.enum';

@Schema({ _id: false })
export class PhoneNumber {
  @Prop({ required: true })
  countryCode!: string;

  @Prop({ required: true })
  phone!: string;
}

const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);

@Schema({ timestamps: true, _id: false })
export class AuthAccount {
  @Prop({
    type: String,
    enum: AuthProvider,
    required: true,
  })
  provider!: AuthProvider;

  @Prop({ required: true })
  providerId!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isPrimary!: boolean;
}

const AuthAccountSchema = SchemaFactory.createForClass(AuthAccount);

@Schema({ collection: COLLECTIONS.USER, timestamps: true })
export class User {
  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Prop()
  primaryEmail?: string;

  @Prop({ type: PhoneNumberSchema })
  primaryPhone?: PhoneNumber;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ default: false })
  isPhoneVerified?: boolean;

  @Prop({ default: false })
  isProfileCompleted!: boolean;

  @Prop({ type: [AuthAccountSchema], default: [] })
  authAccounts!: AuthAccount[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { 'authAccounts.provider': 1, 'authAccounts.providerId': 1 },
  { unique: true },
);
