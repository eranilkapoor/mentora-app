export interface FeatureContext {
  userId: string;

  // optional metadata
  targetUserId?: string;
  deviceId?: string;
  platform?: string;

  // for usage tracking
  action?: string;

  // request info
  ip?: string;
  timestamp?: Date;
}
