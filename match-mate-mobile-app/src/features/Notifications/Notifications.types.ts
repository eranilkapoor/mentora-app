import { HomeNavigationProp } from '@/navigation/types';
import {
  NotificationCategory,
  NotificationType,
} from '@/store/services/notificationApi.service';

export interface NotificationsScreenProps {
  navigation: HomeNavigationProp;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
  iconColor?: string;
  type: NotificationType;
  category: NotificationCategory;
  action?: {
    screen: string;
    params?: Record<string, unknown>;
  };
}

export type NotificationSectionTitle = 'today' | 'yesterday' | 'earlier';

export interface NotifSection {
  title: NotificationSectionTitle;
  icon: string;
  data: Notification[];
}
