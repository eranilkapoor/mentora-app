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
  createdAt?: string;
  unread: boolean;
  icon: string;
  iconColor?: string;
  type: NotificationType;
  category: NotificationCategory;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  action?: {
    screen: string;
    params?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

export type NotificationSectionTitle = 'today' | 'yesterday' | 'earlier';

export interface NotifSection {
  title: NotificationSectionTitle;
  icon: string;
  data: Notification[];
}
