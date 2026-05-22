export interface LinkedAccount {
  provider: string;
  providerId?: string;
  connected: boolean;
  connectedAt?: string;
}

export interface AccountSettingsResponse {
  userId: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  twoFactorEnabled: boolean;

  isDeactivated: boolean;

  deactivatedAt?: string;
  deactivationReason?: string;

  deletionScheduledAt?: string;

  linkedAccounts: LinkedAccount[];

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update 2FA
 */
export interface UpdateTwoFactorPayload {
  enabled: boolean;
}

/**
 * Deactivate Account
 */
export interface DeactivateAccountPayload {
  reason?: string;
}

/**
 * Connect / Disconnect Provider
 */
export interface ConnectProviderPayload {
  provider: string;
}
