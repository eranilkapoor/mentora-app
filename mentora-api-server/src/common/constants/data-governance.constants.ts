export const DATA_SOURCE_OF_TRUTH = {
  accountAccess: {
    source: 'users.status',
    mirrors: ['account_settings.isDeactivated'],
  },
  discoveryVisibility: {
    source: 'profiles.status',
    supportingControls: ['privacy_settings.profileVisibility'],
  },
  membershipEntitlement: {
    source: 'subscriptions',
    readSnapshot: 'users.membership',
  },
  profileLifecycle: {
    loginAccess: 'users.status',
    discoveryVisibility: 'profiles.status',
    accountLifecycleRequests: 'account_settings',
  },
  notificationDelivery: {
    feedState: 'notifications',
    deliveryPreference: 'notification_settings',
    deliveryAudit: 'notification_logs',
    deliverySnapshot: 'notifications.delivery',
  },
  mediaAvailability: {
    source: 'media.status',
    supportingControls: ['media.isActive', 'media.moderationStatus'],
  },
  chatParticipation: {
    membership: 'chat_rooms.participants',
    perUserState: 'chat_rooms.participantStates',
  },
  relationshipSignals: {
    casualInteractions: 'interactions',
    learningRelationships: 'parent_student_relationships',
    scheduledLearning: 'learning_schedules',
    safetyBlocks: 'user_blocks',
    safetyReports: 'user_reports',
  },
} as const;

export const DATA_FIELD_SEMANTICS = {
  media: {
    status:
      'Lifecycle state for file availability: processing, active, or deleted.',
    moderationStatus:
      'Review outcome/state for trust and safety: pending, approved, flagged, or rejected.',
    isActive:
      'Fast visibility flag used by read queries; false hides the media even when historical metadata remains.',
  },
  notifications: {
    notifications:
      'User feed state, read/delete state, action payload, and compact latest delivery snapshot.',
    notificationLogs:
      'Append-only provider/channel delivery attempts, errors, payloads, and retry details.',
  },
  chatRooms: {
    participants:
      'Canonical room membership list. Do not store unread, mute, pin, archive, or read state here.',
    participantStates:
      'Per-participant room state keyed by userId: unread, read cursor, archive, pin, and mute.',
  },
} as const;

export const DATA_RETENTION_POLICY_DAYS = {
  userSessions: 90,
  notificationLogs: 180,
  analyticsEvents: 395,
  activityLogs: 395,
  supportTicketsAfterClose: 730,
  adminAuditLogs: 2555,
  paymentRecords: 2555,
  chatMessages: 1825,
  learningSessions: 1825,
} as const;

export const DATA_ARCHIVE_POLICY_DAYS = {
  chat_messages: {
    archiveAfterDays: 365,
    deleteAfterDays: DATA_RETENTION_POLICY_DAYS.chatMessages,
    archiveCollection: 'chat_messages_archive',
    dateField: 'createdAt',
  },
  notifications: {
    archiveAfterDays: 180,
    deleteAfterDays: 730,
    archiveCollection: 'notifications_archive',
    dateField: 'createdAt',
  },
  notification_logs: {
    archiveAfterDays: 90,
    deleteAfterDays: DATA_RETENTION_POLICY_DAYS.notificationLogs,
    archiveCollection: 'notification_logs_archive',
    dateField: 'createdAt',
  },
  analytics_events: {
    archiveAfterDays: 120,
    deleteAfterDays: DATA_RETENTION_POLICY_DAYS.analyticsEvents,
    archiveCollection: 'analytics_events_archive',
    dateField: 'occurredAt',
  },
  activity_logs: {
    archiveAfterDays: 180,
    deleteAfterDays: DATA_RETENTION_POLICY_DAYS.activityLogs,
    archiveCollection: 'activity_logs_archive',
    dateField: 'createdAt',
  },
} as const;

export const DATA_SCHEMA_VERSION_TARGETS = {
  alreadyVersioned: [
    'plans',
    'features',
    'plan_features',
    'notification_templates',
    'roles',
    'permissions',
    'payments',
    'payment_invoices',
    'subscriptions',
    'promotion_coupons',
    'admin_audit_logs',
    'verifications',
    'user_reports',
  ],
  addWhenTouched: [
    'users',
    'profiles',
    'media',
    'chat_rooms',
    'chat_messages',
    'student_profiles',
    'parent_profiles',
    'parent_student_relationships',
    'learning_schedules',
    'learning_entitlements',
    'ai_tutor_sessions',
    'notifications',
    'notification_logs',
    'support_tickets',
    'analytics_events',
    'activity_logs',
  ],
} as const;

export const DATA_PII_CLASSIFICATION = {
  users: ['email', 'phone', 'authAccounts', 'lastLoginIp', 'lastLoginDevice'],
  profiles: [
    'personal.firstName',
    'personal.lastName',
    'personal.dateOfBirth',
    'personal.city',
    'location',
    'family',
  ],
  media: ['url', 'thumbnailUrl', 'filename'],
  verifications: ['idProofUrl', 'selfieUrl', 'providerPayload'],
  payments: [
    'customer.name',
    'customer.email',
    'customer.phone',
    'customer.gstin',
  ],
  payment_invoices: ['customer.name', 'customer.email', 'customer.phone'],
  support_tickets: ['subject', 'messages.body', 'attachments'],
  chat_messages: ['content', 'attachments'],
  notifications: ['title', 'message', 'metadata'],
  analytics_events: ['ipAddress', 'userAgent', 'deviceId'],
  activity_logs: ['ipAddress', 'userAgent', 'metadata'],
} as const;

export const DATA_ENCRYPTION_STRATEGY = {
  hashedOnly: ['passwordHash', 'refreshTokenHash', 'appPinHash', 'otpHash'],
  fieldEncryptionCandidates: [
    'users.phone',
    'profiles.personal.dateOfBirth',
    'profiles.location',
    'verifications.providerPayload',
    'payments.customer',
    'payment_invoices.customer',
    'support_tickets.messages',
    'chat_messages.content',
  ],
  redactionOnly: [
    'admin_audit_logs.ipAddress',
    'admin_audit_logs.userAgent',
    'notification_logs.providerResponse',
  ],
  keyManagementRequirement:
    'Use provider KMS or MongoDB CSFLE before enabling field-level encryption in production.',
} as const;
