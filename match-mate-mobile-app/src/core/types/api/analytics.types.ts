export enum AnalyticsEventType {
  APP_OPENED = 'APP_OPENED',
  APP_BACKGROUND = 'APP_BACKGROUND',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
}

export enum AnalyticsPlatform {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
  API = 'api',
}

export enum AnalyticsFunnelStage {
  AWARENESS = 'AWARENESS',
  DISCOVERY = 'DISCOVERY',
  INTEREST = 'INTEREST',
  MATCHING = 'MATCHING',
  CONVERSATION = 'CONVERSATION',
  MONETIZATION = 'MONETIZATION',
  RETENTION = 'RETENTION',
}

export interface TrackAnalyticsEventRequest {
  eventType: AnalyticsEventType;
  sessionId?: string;
  deviceId?: string;
  profileId?: string;
  targetUserId?: string;
  matchId?: string;
  chatId?: string;
  funnelStage?: AnalyticsFunnelStage;
  source?: string;
  medium?: string;
  campaign?: string;
  screen?: string;
  country?: string;
  state?: string;
  city?: string;
  isPremium?: boolean;
  success?: boolean;
  durationMs?: number;
  value?: number;
  appVersion?: string;
  metadata?: Record<string, unknown>;
  platform?: AnalyticsPlatform;
}
