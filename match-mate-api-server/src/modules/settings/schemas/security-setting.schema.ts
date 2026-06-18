import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';
import { TwoFactorMethod } from '../enums/settings-preferences.enums';

@Schema({ _id: false })
class LoginDevice {
  @Prop({ required: true }) deviceId!: string;
  @Prop() deviceName?: string;
  @Prop() platform?: string;
  @Prop() ipAddress?: string;
  @Prop() lastActive!: Date;
  @Prop({ default: false }) isCurrent!: boolean;
}

@Schema({ collection: COLLECTION_NAMES.SECURITY_SETTING, timestamps: true })
export class SecuritySetting {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) twoFactorEnabled!: boolean;
  @Prop({
    type: String,
    enum: TwoFactorMethod,
    default: TwoFactorMethod.NONE,
  })
  twoFactorMethod!: TwoFactorMethod;

  @Prop()
  totpSecret?: string;

  @Prop()
  totpEnabledAt?: Date;

  @Prop({ type: [String], default: [] })
  recoveryCodeHashes!: string[];

  @Prop()
  recoveryCodesGeneratedAt?: Date;

  @Prop({ default: false }) biometricEnabled!: boolean;
  @Prop({ default: false }) appPinEnabled!: boolean;
  @Prop() appPinHash?: string;

  @Prop({ default: true }) suspiciousLoginAlerts!: boolean;
  @Prop({ default: true }) loginNotifications!: boolean;

  @Prop({ type: [LoginDevice], default: [] })
  loginDevices!: LoginDevice[];

  @Prop() lastPasswordChangedAt?: Date;
  @Prop() lastLoginAt?: Date;
  @Prop() lastLoginIp?: string;
}

export type SecuritySettingDocument = SecuritySetting & Document;
export const SecuritySettingSchema =
  SchemaFactory.createForClass(SecuritySetting);
