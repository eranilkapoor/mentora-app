export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONTACTS_ONLY = 'contacts_only',
  PREMIUM_ONLY = 'premium_only',
}

export enum VisibilityLevel {
  EVERYONE = 'everyone',
  ACCEPTED_MATCHES = 'accepted_matches',
  CONTACTS_ONLY = 'contacts_only',
  NO_ONE = 'no_one',
}

export enum CommunicationAccess {
  ALL = 'all',
  MATCHES_ONLY = 'matches_only',
  CONTACTS_ONLY = 'contacts_only',
  NO_ONE = 'no_one',
}

export enum TwoFactorMethod {
  NONE = 'none',
  SMS = 'sms',
  AUTHENTICATOR = 'authenticator',
}

export enum AccessibilityFontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large',
}

export enum MediaQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum DateFormat {
  DAY_MONTH_YEAR = 'DD/MM/YYYY',
  MONTH_DAY_YEAR = 'MM/DD/YYYY',
  YEAR_MONTH_DAY = 'YYYY-MM-DD',
}
