import { Theme } from '@/core/theme/types';
import {
  NotificationCategory,
  NotificationType,
} from '@/store/services/notificationApi.service';

export const notificationIconByCategory: Record<NotificationCategory, string> =
  {
    session_scheduled: 'calendar',
    session_reminder: 'clock',
    progress_update: 'trending-up',
    parent_alert: 'shield',
    message_received: 'message-circle',
    subscription: 'credit-card',
    marketing: 'tag',
    system: 'bell',
  };

export const notificationColorByType = (
  theme: Theme,
  type: NotificationType
): string => {
  switch (type) {
    case 'success':
    case 'match':
      return theme.colors.success;
    case 'warning':
      return theme.colors.warning;
    case 'error':
      return theme.colors.error;
    case 'chat':
      return theme.colors.primary;
    case 'payment':
      return theme.colors.verified;
    case 'system':
    case 'info':
    default:
      return theme.colors.textMuted;
  }
};
