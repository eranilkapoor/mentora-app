import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import { AuthProvider } from '../enums';
import { MembershipStatus, MembershipTier, Permission, Status } from 'src/common/enums';

@Schema({ _id: false })
export class PhoneNumber {
  @Prop({ required: true })
  countryCode!: string;

  @Prop({ required: true })
  phone!: string;
}

@Schema({ timestamps: true, _id: false })
export class AuthAccount {
  @Prop({ enum: AuthProvider, required: true })
  provider!: AuthProvider;

  @Prop({ required: true })
  providerId!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop()
  lastUsedAt?: Date;
}

@Schema({ collection: COLLECTIONS.USER, timestamps: true })
export class User {
  @Prop({
    type: String,
    enum: Status,
    default: Status.PENDING,
  })
  status!: Status;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ type: PhoneNumber })
  phone?: PhoneNumber;

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({ default: false })
  isPhoneVerified!: boolean;

  @Prop({ default: false })
  isOnboardingCompleted!: boolean;

  // 🔐 RBAC
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Role' }],
    default: [],
  })
  roles!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  permissions!: Permission[];

  @Prop({
    type: {
      tier: {
        type: String,
        enum: MembershipTier,
        default: MembershipTier.FREE,
      },
      status: {
        type: String,
        enum: MembershipStatus,
        default: MembershipStatus.ACTIVE,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      planId: {
        type: String,
      },
    },
    default: {},
  })
  membership!: {
    tier: MembershipTier;
    status: MembershipStatus;
    startDate: Date;
    expiresAt?: Date;
    autoRenew?: boolean;
    planId?: string;
  };

  // 🔑 Auth
  @Prop({ type: [AuthAccount], default: [] })
  authAccounts!: AuthAccount[];

  // 🔒 Security
  @Prop({ default: 0 })
  failedLoginAttempts!: number;

  @Prop()
  lockUntil?: Date;

  @Prop()
  lastPasswordChangedAt?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop()
  lastLoginDevice?: string;

  @Prop({ default: () => new Date() })
  lastLoginAt!: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } });
UserSchema.index({ 'phone.phone': 1 }, { unique: true, sparse: true });
UserSchema.index({ 'authAccounts.provider': 1, 'authAccounts.providerId': 1 }, { unique: true });
