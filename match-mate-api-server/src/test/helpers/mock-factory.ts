/**
 * Centralized mock factory for unit tests.
 * Creates jest.fn() stubs for all common services and repositories.
 */

export const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    const cfg: Record<string, string | number> = {
      env: 'test',
      port: 3000,
      'jwt.secret': 'test-secret',
      'jwt.accessExpiresIn': '15m',
    };
    return cfg[key] ?? undefined;
  }),
});

export const mockJwtService = () => ({
  sign: jest.fn(() => 'mock-access-token'),
  verify: jest.fn(() => ({ sub: 'user-id-1', email: 'test@test.com' })),
  decode: jest.fn(() => ({ sub: 'user-id-1' })),
});

export const mockCacheService = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delByPattern: jest.fn().mockResolvedValue(undefined),
  has: jest.fn().mockResolvedValue(false),
  flush: jest.fn().mockResolvedValue(undefined),
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(undefined),
});

export const mockAppLogger = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn(),
});

// ─── Auth / User ─────────────────────────────────────────────────────────────

export const mockUserRepository = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdWithRoles: jest.fn(),
  findByPhone: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  updateRoles: jest.fn(),
  findBySocialId: jest.fn(),
});

export const mockAuthTokenService = () => ({
  generatePayload: jest.fn(() => ({
    sub: 'user-id-1',
    email: 'test@test.com',
  })),
  generateTokens: jest.fn(() => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  })),
  verifyRefreshToken: jest.fn(() => ({ sub: 'user-id-1' })),
});

export const mockOtpService = () => ({
  sendOtp: jest
    .fn()
    .mockResolvedValue({ phone: '+911234567890', otp: '123456' }),
  verifyOtp: jest.fn().mockResolvedValue(true),
});

export const mockProfileService = () => ({
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  getMyProfile: jest.fn(),
  updatePersonalInfo: jest.fn(),
  updatePhysicalInfo: jest.fn(),
  updateEducationInfo: jest.fn(),
  updateFamilyInfo: jest.fn(),
  updatePreferences: jest.fn(),
});

// ─── Notification ─────────────────────────────────────────────────────────────

export const mockNotificationRepository = () => ({
  findUserById: jest.fn(),
  getOrCreateUserSettings: jest.fn(),
  createNotification: jest.fn(),
  getUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
  listTemplates: jest.fn(),
  getTemplate: jest.fn(),
  upsertTemplate: jest.fn(),
  getAnalytics: jest.fn(),
  listDeadLetterJobs: jest.fn(),
  getDeadLetterJob: jest.fn(),
  replayJob: jest.fn(),
  replayAllJobs: jest.fn(),
  purgeJobs: jest.fn(),
});

export const mockNotificationQueueService = () => ({
  enqueue: jest.fn().mockResolvedValue({ id: 'job-1' }),
  getDeadLetterJobs: jest.fn().mockResolvedValue([]),
  getDeadLetterJob: jest.fn(),
  replayJob: jest.fn(),
  replayAll: jest.fn(),
  purge: jest.fn(),
});

// ─── Storage ─────────────────────────────────────────────────────────────────

export const mockStorageService = () => ({
  uploadFile: jest.fn().mockResolvedValue({
    filename: 'mock-file.jpg',
    url: 'https://cdn.test/mock-file.jpg',
  }),
  uploadFiles: jest
    .fn()
    .mockResolvedValue([
      { filename: 'mock-file.jpg', url: 'https://cdn.test/mock-file.jpg' },
    ]),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  getUrl: jest.fn().mockReturnValue('https://cdn.test/mock-file.jpg'),
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

type MockChatService = {
  health: jest.Mock;
  createOrGetDirectRoom: jest.Mock;
  getConversations: jest.Mock;
  getContacts: jest.Mock;
  getConversationDetail: jest.Mock;
  getMessages: jest.Mock;
  sendMessage: jest.Mock;
  markRoomRead: jest.Mock;
  updateRoomSettings: jest.Mock;
};

export const mockChatService = (): MockChatService => ({
  health: jest.fn().mockReturnValue({
    status: 'ok',
    transport: 'socket.io',
    timestamp: expect.any(String) as unknown as string,
  }),
  createOrGetDirectRoom: jest.fn(),
  getConversations: jest.fn(),
  getContacts: jest.fn(),
  getConversationDetail: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  markRoomRead: jest.fn(),
  updateRoomSettings: jest.fn(),
});

// ─── Match ─────────────────────────────────────────────────────────────────────

export const mockMatchService = () => ({
  sendInterest: jest.fn(),
  respondToInterest: jest.fn(),
  getMyMatches: jest.fn(),
});

// ─── Payment ─────────────────────────────────────────────────────────────────

export const mockPaymentService = () => ({
  createOrder: jest.fn(),
  verifyPayment: jest.fn(),
  markPaymentFailed: jest.fn(),
  processWebhook: jest.fn(),
  getUserPayments: jest.fn(),
  getUserPaymentDetail: jest.fn(),
});

// ─── Plan ─────────────────────────────────────────────────────────────────────

export const mockPlanService = () => ({
  createPlan: jest.fn(),
  updatePlan: jest.fn(),
  getPlans: jest.fn(),
  getPlanById: jest.fn(),
  getAllPlansWithFeatures: jest.fn(),
  createFeature: jest.fn(),
  getFeatures: jest.fn(),
  assignFeatureToPlan: jest.fn(),
  removeFeatureFromPlan: jest.fn(),
});

// ─── Admin ─────────────────────────────────────────────────────────────────────

export const mockAdminService = () => ({
  getUsers: jest.fn(),
  updateUserStatus: jest.fn(),
  broadcast: jest.fn(),
});

// ─── Analytics ─────────────────────────────────────────────────────────────────

export const mockAnalyticsService = () => ({
  trackEvent: jest.fn(),
  getStats: jest.fn(),
  getOverview: jest.fn(),
  getFunnel: jest.fn(),
});

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export const mockRbacService = () => ({
  createPermission: jest.fn(),
  getPermissions: jest.fn(),
  deletePermission: jest.fn(),
  createRole: jest.fn(),
  getRoles: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  assignRoles: jest.fn(),
});

// ─── Subscription ─────────────────────────────────────────────────────────────

export const mockSubscriptionService = () => ({
  purchasePlan: jest.fn(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal mock Express request with JWT user injected */
export const buildReq = (overrides: Record<string, unknown> = {}) => ({
  user: { sub: 'user-id-1', email: 'test@test.com', roles: [] },
  ip: '127.0.0.1',
  headers: { 'x-platform': 'mobile', 'user-agent': 'jest-test' },
  ...overrides,
});

/** Build a minimal mock Express response */
export const buildRes = () => {
  const res: Record<string, jest.Mock> = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/** Stub Mongoose model with common query methods */
export const mockMongooseModel = () => ({
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findOneAndUpdate: jest.fn().mockReturnThis(),
  create: jest.fn(),
  save: jest.fn(),
  exec: jest.fn().mockResolvedValue(null),
  lean: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockReturnThis(),
  deleteOne: jest.fn().mockReturnThis(),
  deleteMany: jest.fn().mockReturnThis(),
});
