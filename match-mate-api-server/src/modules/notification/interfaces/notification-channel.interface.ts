import {
  DeliveryLogChannel,
  DeliveryLogStatus,
} from '../notification.constants';

export interface NotificationChannelPayload {
  notificationId: string;
  userId: string;
  to: string | string[];
  title?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
  templateKey?: string;
}

export interface NotificationChannelResult {
  status: DeliveryLogStatus;
  provider?: string;
  providerResponse?: string;
  error?: string;
  responsePayload?: Record<string, unknown>;
}

export interface NotificationChannelProvider {
  readonly channel: DeliveryLogChannel;
  send(payload: NotificationChannelPayload): Promise<NotificationChannelResult>;
}
