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
  @Prop({ type: Types.ObjectId, required: true, unique: true })
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

  @Prop({ type: [String], default: [] })
  allowedIpCidrs!: string[];

  @Prop({ default: 0 })
  maxActiveSessions!: number;

  @Prop({ default: false })
  requirePasswordChange!: boolean;

  @Prop({ type: Object, default: {} })
  riskPolicy!: Record<string, unknown>;
}

export type SecuritySettingDocument = SecuritySetting & Document;
export const SecuritySettingSchema =
  SchemaFactory.createForClass(SecuritySetting);
SecuritySettingSchema.index({ twoFactorEnabled: 1, lastLoginAt: -1 });
