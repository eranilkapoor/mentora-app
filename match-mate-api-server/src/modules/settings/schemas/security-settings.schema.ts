import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

@Schema({ _id: false })
class LoginDevice {
  @Prop({ required: true }) deviceId!: string;
  @Prop() deviceName?: string;
  @Prop() platform?: string;
  @Prop() ipAddress?: string;
  @Prop() lastActive!: Date;
  @Prop({ default: false }) isCurrent!: boolean;
}

@Schema({ collection: COLLECTIONS.SECURITY_SETTINGS, timestamps: true })
export class SecuritySettings {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ default: false }) twoFactorEnabled!: boolean;
  @Prop({
    type: String,
    enum: ['none', 'sms', 'email', 'authenticator'],
    default: 'none',
  })
  twoFactorMethod!: string;

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

export type SecuritySettingsDocument = SecuritySettings & Document;
export const SecuritySettingsSchema =
  SchemaFactory.createForClass(SecuritySettings);
