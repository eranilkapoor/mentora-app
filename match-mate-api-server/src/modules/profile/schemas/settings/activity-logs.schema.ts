import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';

export enum ActivityAction {
  // 🔐 AUTH & SECURITY
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  REFRESH_TOKEN = 'refresh_token',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  CHANGE_PASSWORD = 'change_password',

  // ✅ VERIFICATION
  VERIFY_EMAIL = 'verify_email',
  VERIFY_PHONE = 'verify_phone',
  RESEND_OTP = 'resend_otp',

  // 👤 PROFILE
  CREATE_PROFILE = 'create_profile',
  UPDATE_PROFILE = 'update_profile',
  DELETE_PROFILE = 'delete_profile',
  UPLOAD_PROFILE_IMAGE = 'upload_profile_image',
  DELETE_PROFILE_IMAGE = 'delete_profile_image',

  // 💳 SUBSCRIPTION / MONETIZATION
  SUBSCRIPTION_PURCHASE = 'subscription_purchase',
  SUBSCRIPTION_UPGRADE = 'subscription_upgrade',
  SUBSCRIPTION_DOWNGRADE = 'subscription_downgrade',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
  SUBSCRIPTION_EXPIRE = 'subscription_expire',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',

  // 🚨 SAFETY & MODERATION
  ACCOUNT_BLOCKED = 'account_blocked',
  ACCOUNT_UNBLOCKED = 'account_unblocked',
  USER_REPORTED = 'user_reported',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',

  // ⚙️ SETTINGS
  UPDATE_SETTINGS = 'update_settings',
  ENABLE_NOTIFICATIONS = 'enable_notifications',
  DISABLE_NOTIFICATIONS = 'disable_notifications',

  // 📱 DEVICE / SESSION
  DEVICE_REGISTERED = 'device_registered',
  DEVICE_REMOVED = 'device_removed',
  SESSION_REVOKED = 'session_revoked',
  LOGOUT_ALL_DEVICES = 'logout_all_devices',

  // 🧠 SYSTEM / ADMIN (VERY IMPORTANT)
  ADMIN_UPDATE_USER = 'admin_update_user',
  ADMIN_DELETE_USER = 'admin_delete_user',
  ADMIN_VERIFY_PROFILE = 'admin_verify_profile',
  ADMIN_ASSIGN_ROLE = 'admin_assign_role',
}

export enum ActivityCategory {
  AUTH = 'auth',
  PROFILE = 'profile',
  PAYMENT = 'payment',
  SAFETY = 'safety',
  ADMIN = 'admin',
}

export enum ActivityPlatform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

@Schema({ collection: COLLECTIONS.ACTIVITY_LOG, timestamps: true })
export class ActivityLog {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: ActivityCategory })
  category!: ActivityCategory;

  @Prop({ enum: ActivityAction, required: true })
  action?: ActivityAction;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  ip?: string;

  @Prop()
  device?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  requestId?: string;

  @Prop()
  correlationId?: string;

  @Prop({ enum: ActivityPlatform })
  platform?: ActivityPlatform;
}

export type ActivityLogDocument = ActivityLog & Document;
export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1 });
