export const NOTIFICATION_TYPES = [
  'info',
  'success',
  'warning',
  'error',
  'learning',
  'chat',
  'system',
  'payment',
] as const;

export const NOTIFICATION_CATEGORIES = [
  'session_scheduled',
  'session_reminder',
  'progress_update',
  'parent_alert',
  'message_received',
  'subscription',
  'system',
] as const;

export const NOTIFICATION_CHANNELS = [
  'in_app',
  'push',
  'email',
  'sms',
] as const;

export const DELIVERY_LOG_CHANNELS = ['push', 'email', 'sms'] as const;

export const DELIVERY_LOG_STATUSES = [
  'pending',
  'sent',
  'failed',
  'skipped',
] as const;

export const NOTIFICATION_PRIORITIES = [
  'low',
  'normal',
  'high',
  'critical',
] as const;

export const NOTIFICATION_TEMPLATE_STATUSES = [
  'draft',
  'active',
  'archived',
] as const;

export const NOTIFICATION_DEVICE_PLATFORMS = [
  'ios',
  'android',
  'web',
  'unknown',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type DeliveryLogChannel = (typeof DELIVERY_LOG_CHANNELS)[number];
export type DeliveryLogStatus = (typeof DELIVERY_LOG_STATUSES)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];
export type NotificationTemplateStatus =
  (typeof NOTIFICATION_TEMPLATE_STATUSES)[number];
export type NotificationDevicePlatform =
  (typeof NOTIFICATION_DEVICE_PLATFORMS)[number];
