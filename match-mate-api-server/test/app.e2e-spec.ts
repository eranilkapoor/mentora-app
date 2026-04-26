/**
 * E2E Test Suite - Match-Mate API Server
 *
 * Strategy: Each controller is tested using a NestJS testing module with all
 * heavy dependencies (MongoDB, Redis, BullMQ, Firebase, etc.) mocked out.
 * This gives us true HTTP-layer integration tests without requiring real services.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Controllers
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { ProfileController } from '../src/modules/profile/profile.controller';
import { ProfileService } from '../src/modules/profile/profile.service';
import { MatchController } from '../src/modules/match/match.controller';
import { MatchService } from '../src/modules/match/match.service';
import { ChatController } from '../src/modules/chat/chat.controller';
import { ChatService } from '../src/modules/chat/chat.service';
import { NotificationController } from '../src/modules/notification/notification.controller';
import { NotificationService } from '../src/modules/notification/notification.service';
import { PaymentController } from '../src/modules/payment/payment.controller';
import { PaymentService } from '../src/modules/payment/payment.service';
import { PlanController } from '../src/modules/plan/plan.controller';
import { PlanService } from '../src/modules/plan/services/plan.service';
import { AdminController } from '../src/modules/admin/admin.controller';
import { AdminService } from '../src/modules/admin/admin.service';
import { AnalyticsController } from '../src/modules/analytics/analytics.controller';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { RbacController } from '../src/modules/rbac/rbac.controller';
import { RbacService } from '../src/modules/rbac/rbac.service';

// Guards
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../src/modules/admin/guards/admin.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { PermissionsGuard } from '../src/modules/auth/guards/permissions.guard';

// Common
import { ConfigService } from '@nestjs/config';

// ─── Shared Mock Services ───────────────────────────────────────────────────

const mockConfigService = {
  get: jest.fn().mockReturnValue('test'),
  getOrThrow: jest.fn().mockReturnValue('test'),
};

// Mock user extracted from JWT (added by JwtAuthGuard to req.user)
const MOCK_USER = { sub: 'user-id-1', email: 'test@test.com', roles: [] };
const AUTH_TOKEN = 'Bearer mock-jwt-token';

const mockAppService = {
  getRoot: jest.fn(() => ({
    message: 'Matrimony API is running 🚀',
    version: 'v1',
    timestamp: new Date().toISOString(),
  })),
  healthCheck: jest.fn(() => ({
    status: 'ok',
    uptime: 123,
    timestamp: new Date().toISOString(),
    env: 'test',
    memory: { rss: 1024, heapUsed: 512 },
  })),
};

const mockAuthService = {
  register: jest
    .fn()
    .mockResolvedValue({ user: { userId: 'user-1' }, accessToken: 'tok' }),
  login: jest
    .fn()
    .mockResolvedValue({ user: { userId: 'user-1' }, accessToken: 'tok' }),
  sendOtp: jest.fn().mockReturnValue({ phone: '+911234567890', otp: '123456' }),
  verifyOtp: jest.fn().mockResolvedValue({ accessToken: 'tok' }),
  socialLogin: jest.fn().mockResolvedValue({ accessToken: 'tok' }),
  forgotPassword: jest.fn().mockResolvedValue({ message: 'Reset email sent' }),
  onboardingProfile: jest.fn().mockResolvedValue({}),
  verifyUser: jest.fn().mockResolvedValue({ isVerified: true }),
  refresh: jest.fn().mockResolvedValue({ accessToken: 'new-tok' }),
  logout: jest.fn().mockResolvedValue(undefined),
  logoutAll: jest.fn().mockResolvedValue(undefined),
};

const mockProfileService = {
  createProfile: jest
    .fn()
    .mockResolvedValue({ userId: 'user-1', firstName: 'Test' }),
  updateProfile: jest.fn().mockResolvedValue({ userId: 'user-1' }),
  updatePersonalInfo: jest.fn().mockResolvedValue({}),
  updatePhysicalInfo: jest.fn().mockResolvedValue({}),
  updateEducationInfo: jest.fn().mockResolvedValue({}),
  updateFamilyInfo: jest.fn().mockResolvedValue({}),
  updatePreferences: jest.fn().mockResolvedValue({}),
  getPrivacySettings: jest.fn().mockResolvedValue({
    profileVisibility: 'public',
    hidePhotos: false,
  }),
  updatePrivacySettings: jest.fn().mockResolvedValue({
    profileVisibility: 'private',
    hidePhotos: true,
  }),
  getImages: jest
    .fn()
    .mockResolvedValue([
      { _id: 'img-1', url: 'https://cdn.local/img-1.jpg', isPrimary: true },
    ]),
  addImages: jest.fn().mockResolvedValue({
    profileImages: [{ _id: 'img-1', url: 'https://cdn.local/img-1.jpg' }],
  }),
  setPrimaryImage: jest.fn().mockResolvedValue({ success: true }),
  removeImage: jest.fn().mockResolvedValue({ success: true }),
  getVideos: jest
    .fn()
    .mockResolvedValue([
      { _id: 'vid-1', url: 'https://cdn.local/vid-1.mp4', isPrimary: true },
    ]),
  addVideos: jest.fn().mockResolvedValue({
    profileVideos: [{ _id: 'vid-1', url: 'https://cdn.local/vid-1.mp4' }],
  }),
  setPrimaryVideo: jest.fn().mockResolvedValue({ success: true }),
  removeVideo: jest.fn().mockResolvedValue({ success: true }),
  getMyProfile: jest.fn().mockResolvedValue({ userId: 'user-1' }),
};

const mockMatchService = {
  sendInterest: jest
    .fn()
    .mockReturnValue({ _id: 'interest-1', status: 'PENDING' }),
  respondToInterest: jest
    .fn()
    .mockResolvedValue({ _id: 'interest-1', status: 'ACCEPTED' }),
  getMyMatches: jest.fn().mockReturnValue([]),
};

const mockChatService = {
  health: jest.fn().mockReturnValue({
    status: 'ok',
    transport: 'socket.io',
    timestamp: new Date().toISOString(),
  }),
  getConversations: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  getContacts: jest.fn().mockResolvedValue({ contacts: [] }),
  createOrGetDirectRoom: jest.fn().mockResolvedValue({ roomId: 'room-1' }),
  getConversationDetail: jest.fn().mockResolvedValue({ roomId: 'room-1' }),
  getMessages: jest.fn().mockResolvedValue({ messages: [], total: 0 }),
  sendMessage: jest.fn().mockResolvedValue({ _id: 'msg-1', text: 'Hello' }),
  markRoomRead: jest.fn().mockResolvedValue({}),
  updateRoomSettings: jest.fn().mockResolvedValue({}),
};

const mockNotificationService = {
  getUserNotifications: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  getUnreadCount: jest.fn().mockResolvedValue(3),
  getSettings: jest.fn().mockResolvedValue({ email: true, push: true }),
  updateSettings: jest.fn().mockResolvedValue({}),
  notify: jest.fn().mockResolvedValue({ jobId: 'job-1' }),
  sendTemplateNotification: jest.fn().mockResolvedValue({ jobId: 'job-2' }),
  listTemplates: jest.fn().mockResolvedValue([]),
  getAnalytics: jest.fn().mockResolvedValue({}),
  listDeadLetterJobs: jest.fn().mockResolvedValue([]),
  getDeadLetterJob: jest.fn().mockResolvedValue({}),
  replayDeadLetterJob: jest.fn().mockResolvedValue(undefined),
  replayAllDeadLetterJobs: jest.fn().mockResolvedValue(undefined),
  purgeDeadLetterJobs: jest.fn().mockResolvedValue(undefined),
  upsertTemplate: jest.fn().mockResolvedValue({}),
  markRead: jest.fn().mockResolvedValue(undefined),
  markAllRead: jest.fn().mockResolvedValue(undefined),
};

const mockPaymentService = {
  createOrder: jest.fn().mockResolvedValue({ orderId: 'ord-1', amount: 999 }),
  verifyPayment: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
  markPaymentFailed: jest.fn().mockResolvedValue({ status: 'FAILED' }),
  processWebhook: jest.fn().mockResolvedValue({ success: true }),
  getUserPayments: jest.fn().mockResolvedValue({ payments: [], total: 0 }),
  getUserPaymentDetail: jest.fn().mockResolvedValue({ orderId: 'ord-1' }),
};

const mockPlanService = {
  createPlan: jest.fn().mockResolvedValue({ _id: 'plan-1', name: 'Gold' }),
  updatePlan: jest.fn().mockResolvedValue({ _id: 'plan-1' }),
  getPlans: jest.fn().mockResolvedValue([{ _id: 'plan-1', name: 'Gold' }]),
  getPlanById: jest.fn().mockResolvedValue({ _id: 'plan-1', features: [] }),
  getAllPlansWithFeatures: jest.fn().mockResolvedValue([]),
  createFeature: jest.fn().mockResolvedValue({ _id: 'feat-1', key: 'CHAT' }),
  getFeatures: jest.fn().mockResolvedValue([]),
  assignFeatureToPlan: jest.fn().mockResolvedValue({}),
  removeFeatureFromPlan: jest.fn().mockResolvedValue({ success: true }),
};

const mockAdminService = {
  getUsers: jest.fn().mockReturnValue({ items: [], total: 0 }),
  updateUserStatus: jest.fn().mockReturnValue({ _id: 'user-1' }),
  broadcast: jest
    .fn()
    .mockReturnValue({ success: true, message: 'Broadcast sent' }),
};

const mockAnalyticsService = {
  trackEvent: jest.fn().mockReturnValue(undefined),
  getStats: jest.fn().mockReturnValue({ totalEvents: 0 }),
  getOverview: jest.fn().mockReturnValue({ totalEvents: 0, uniqueUsers: 0 }),
  getFunnel: jest.fn().mockReturnValue({ steps: [] }),
};

const mockRbacService = {
  createPermission: jest.fn().mockReturnValue({ _id: 'perm-1' }),
  getPermissions: jest.fn().mockReturnValue([]),
  deletePermission: jest.fn().mockReturnValue(undefined),
  createRole: jest.fn().mockReturnValue({ _id: 'role-1' }),
  getRoles: jest.fn().mockReturnValue([]),
  updateRole: jest.fn().mockReturnValue({ _id: 'role-1' }),
  deleteRole: jest.fn().mockReturnValue(undefined),
  assignRoles: jest.fn().mockReturnValue({ _id: 'user-1', roles: [] }),
};

// ─── App Factory ────────────────────────────────────────────────────────────

async function buildTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [
      AppController,
      AuthController,
      ProfileController,
      MatchController,
      ChatController,
      NotificationController,
      PaymentController,
      PlanController,
      AdminController,
      AnalyticsController,
      RbacController,
    ],
    providers: [
      { provide: AppService, useValue: mockAppService },
      { provide: AuthService, useValue: mockAuthService },
      { provide: ProfileService, useValue: mockProfileService },
      { provide: MatchService, useValue: mockMatchService },
      { provide: ChatService, useValue: mockChatService },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: PaymentService, useValue: mockPaymentService },
      { provide: PlanService, useValue: mockPlanService },
      { provide: AdminService, useValue: mockAdminService },
      { provide: AnalyticsService, useValue: mockAnalyticsService },
      { provide: RbacService, useValue: mockRbacService },
      { provide: ConfigService, useValue: mockConfigService },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = MOCK_USER;
        return true;
      },
    })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(PermissionsGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('E2E – App (Root & Health)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1 → 200 with API info', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body.version).toBe('v1');
      });
  });

  it('GET /api/v1/health → 200 with status ok', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });
});

// ─── AUTH ───────────────────────────────────────────────────────────────────

describe('E2E – Auth', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('POST /api/v1/auth/register → 201 with tokens', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Pass1234!',
        phone: '1234567890',
        country_code: '+91',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('POST /api/v1/auth/login → 201 with tokens', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Pass1234!' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('POST /api/v1/auth/send-otp → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ country_code: '+91', phone: '1234567890' })
      .expect(201);
  });

  it('POST /api/v1/auth/verify-otp → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ country_code: '+91', phone: '1234567890', otp: '123456' })
      .expect(201);
  });

  it('POST /api/v1/auth/social-login → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/social-login')
      .send({ provider: 'google', token: 'google-token' })
      .expect(201);
  });

  it('GET /api/v1/auth/verify-user → 200 with isVerified', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/verify-user')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.isVerified).toBe(true);
      });
  });

  it('POST /api/v1/auth/logout → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', AUTH_TOKEN)
      .send({ refreshToken: 'refresh-tok' })
      .expect(201);
  });

  it('POST /api/v1/auth/logout-all → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/logout-all')
      .set('Authorization', AUTH_TOKEN)
      .expect(201);
  });
});

// ─── PROFILE ────────────────────────────────────────────────────────────────

describe('E2E – Profile', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/profile/me → 200 with profile', () => {
    return request(app.getHttpServer())
      .get('/api/v1/profile/me')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('POST /api/v1/profile → 201 on create', () => {
    return request(app.getHttpServer())
      .post('/api/v1/profile')
      .set('Authorization', AUTH_TOKEN)
      .send({
        personal: {
          profileFor: 'self',
          firstName: 'Test',
          gender: 'male',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: { height: 175 },
        education: { qualification: 'B.Tech', occupation: 'Engineer' },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('PATCH /api/v1/profile → 200 on update', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile')
      .set('Authorization', AUTH_TOKEN)
      .send({
        personal: {
          profileFor: 'self',
          firstName: 'Updated',
          gender: 'male',
          dateOfBirth: '1995-01-01',
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
      })
      .expect(200);
  });

  it('PATCH /api/v1/profile/personal → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/personal')
      .set('Authorization', AUTH_TOKEN)
      .send({
        profileFor: 'self',
        firstName: 'John',
        gender: 'male',
        dateOfBirth: '1995-01-01',
        religion: 'hindu',
        maritalStatus: 'never_married',
      })
      .expect(200);
  });

  it('PATCH /api/v1/profile/physical → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/physical')
      .set('Authorization', AUTH_TOKEN)
      .send({ height: 175 })
      .expect(200);
  });

  it('PATCH /api/v1/profile/education → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/education')
      .set('Authorization', AUTH_TOKEN)
      .send({ qualification: 'B.Tech', occupation: 'Engineer' })
      .expect(200);
  });

  it('PATCH /api/v1/profile/family → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/family')
      .set('Authorization', AUTH_TOKEN)
      .send({ familyStatus: 'middle_class' })
      .expect(200);
  });

  it('PATCH /api/v1/profile/preferences → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/preferences')
      .set('Authorization', AUTH_TOKEN)
      .send({
        partnerPreference: {
          ageRange: { min: 22, max: 30 },
        },
      })
      .expect(200);
  });

  it('GET /api/v1/profile/privacy → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/profile/privacy')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.profileVisibility).toBe('public');
      });
  });

  it('PATCH /api/v1/profile/privacy → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/privacy')
      .set('Authorization', AUTH_TOKEN)
      .send({ profileVisibility: 'private', hidePhotos: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('GET /api/v1/profile/images → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/profile/images')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('POST /api/v1/profile/images → 201 multipart upload', () => {
    return request(app.getHttpServer())
      .post('/api/v1/profile/images')
      .set('Authorization', AUTH_TOKEN)
      .attach('images', Buffer.from('fake-jpg-content'), {
        filename: 'profile-1.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('PATCH /api/v1/profile/images/:imageId/primary → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/images/img-1/primary')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('DELETE /api/v1/profile/images/:imageId → 200', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/profile/images/img-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('GET /api/v1/profile/videos → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/profile/videos')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('POST /api/v1/profile/videos → 201 multipart upload', () => {
    return request(app.getHttpServer())
      .post('/api/v1/profile/videos')
      .set('Authorization', AUTH_TOKEN)
      .attach('videos', Buffer.from('fake-mp4-content'), {
        filename: 'intro.mp4',
        contentType: 'video/mp4',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('PATCH /api/v1/profile/videos/:videoId/primary → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/profile/videos/vid-1/primary')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('DELETE /api/v1/profile/videos/:videoId → 200', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/profile/videos/vid-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });
});

// ─── MATCH ──────────────────────────────────────────────────────────────────

describe('E2E – Match', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('POST /api/v1/match/interest → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/match/interest')
      .set('Authorization', AUTH_TOKEN)
      .send({ receiverId: 'receiver-1' })
      .expect(201);
  });

  it('POST /api/v1/match/respond → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/match/respond')
      .set('Authorization', AUTH_TOKEN)
      .send({ interestId: 'interest-1', action: 'ACCEPT' })
      .expect(201);
  });

  it('GET /api/v1/match/my → 200 with matches', () => {
    return request(app.getHttpServer())
      .get('/api/v1/match/my')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });
});

// ─── CHAT ───────────────────────────────────────────────────────────────────

describe('E2E – Chat', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/chat/health → 200 (public)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chat/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('GET /api/v1/chat/conversations → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chat/conversations')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('GET /api/v1/chat/contacts → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chat/contacts')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/chat/rooms/direct → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/chat/rooms/direct')
      .set('Authorization', AUTH_TOKEN)
      .send({ targetUserId: 'target-1' })
      .expect(201);
  });

  it('GET /api/v1/chat/rooms/:roomId → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chat/rooms/room-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/chat/rooms/:roomId/messages → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/chat/rooms/room-1/messages')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/chat/rooms/:roomId/messages → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/chat/rooms/room-1/messages')
      .set('Authorization', AUTH_TOKEN)
      .send({ text: 'Hello', type: 'TEXT' })
      .expect(201);
  });

  it('POST /api/v1/chat/rooms/:roomId/read → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/chat/rooms/room-1/read')
      .set('Authorization', AUTH_TOKEN)
      .send({})
      .expect(201);
  });
});

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

describe('E2E – Notifications', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/notifications → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('total');
      });
  });

  it('GET /api/v1/notifications/unread-count → 200 with count', () => {
    return request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.unreadCount).toBe(3);
      });
  });

  it('GET /api/v1/notifications/settings → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/notifications/settings')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('PATCH /api/v1/notifications/settings → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/notifications/settings')
      .set('Authorization', AUTH_TOKEN)
      .send({ email: false })
      .expect(200);
  });

  it('POST /api/v1/notifications/:id/read → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/notifications/notif-1/read')
      .set('Authorization', AUTH_TOKEN)
      .expect(201);
  });

  it('POST /api/v1/notifications/read-all → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/notifications/read-all')
      .set('Authorization', AUTH_TOKEN)
      .expect(201);
  });
});

// ─── PAYMENTS ───────────────────────────────────────────────────────────────

describe('E2E – Payments', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('POST /api/v1/payments/order → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/payments/order')
      .set('Authorization', AUTH_TOKEN)
      .send({ planId: 'plan-1' })
      .expect(201)
      .expect((res) => {
        expect(res.body.orderId).toBe('ord-1');
      });
  });

  it('POST /api/v1/payments/verify → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/payments/verify')
      .set('Authorization', AUTH_TOKEN)
      .send({ orderId: 'ord-1', paymentId: 'pay-1', signature: 'sig' })
      .expect(201);
  });

  it('POST /api/v1/payments/webhook → 201 (public)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/payments/webhook')
      .send({ event: 'payment.captured', orderId: 'ord-1' })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('GET /api/v1/payments/my-payments → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/payments/my-payments')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/payments/:orderId → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/payments/ord-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200)
      .expect((res) => {
        expect(res.body.orderId).toBe('ord-1');
      });
  });
});

// ─── ADMIN PLANS ────────────────────────────────────────────────────────────

describe('E2E – Plans (Admin)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/admin/plans → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/plans')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/admin/plans → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/plans')
      .set('Authorization', AUTH_TOKEN)
      .send({ name: 'Gold', price: 999, durationDays: 30 })
      .expect(201);
  });

  it('GET /api/v1/admin/plans/:id → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/plans/plan-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/admin/plans/full/all → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/plans/full/all')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/admin/plans/feature/all → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/plans/feature/all')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });
});

// ─── ADMIN USERS ────────────────────────────────────────────────────────────

describe('E2E – Admin Users', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/admin/users → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('PATCH /api/v1/admin/users/status → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/admin/users/status')
      .set('Authorization', AUTH_TOKEN)
      .send({ userId: 'user-1', isBlocked: true })
      .expect(200);
  });

  it('PATCH /api/v1/admin/broadcast → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/admin/broadcast')
      .set('Authorization', AUTH_TOKEN)
      .send({ title: 'Test', body: 'Hello all' })
      .expect(200);
  });
});

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

describe('E2E – Analytics', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('POST /api/v1/analytics/track → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/analytics/track')
      .set('Authorization', AUTH_TOKEN)
      .send({ event: 'PROFILE_VIEWED', userId: 'user-1' })
      .expect(201);
  });

  it('GET /api/v1/analytics/stats → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/stats')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/analytics/overview → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/overview')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/analytics/funnel → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/funnel')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });
});

// ─── RBAC ───────────────────────────────────────────────────────────────────

describe('E2E – RBAC (Admin)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await buildTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  afterEach(() => jest.clearAllMocks());

  it('GET /api/v1/admin/rbac/permissions → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/rbac/permissions')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/admin/rbac/permissions → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/rbac/permissions')
      .set('Authorization', AUTH_TOKEN)
      .send({ action: 'ADMIN_MANAGE', resource: 'users' })
      .expect(201);
  });

  it('DELETE /api/v1/admin/rbac/permissions/:id → 200', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/admin/rbac/permissions/perm-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('GET /api/v1/admin/rbac/roles → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/admin/rbac/roles')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/admin/rbac/roles → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/rbac/roles')
      .set('Authorization', AUTH_TOKEN)
      .send({ name: 'admin', permissions: [] })
      .expect(201);
  });

  it('PATCH /api/v1/admin/rbac/roles/:id → 200', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/admin/rbac/roles/role-1')
      .set('Authorization', AUTH_TOKEN)
      .send({ name: 'SUPER_ADMIN' })
      .expect(200);
  });

  it('DELETE /api/v1/admin/rbac/roles/:id → 200', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/admin/rbac/roles/role-1')
      .set('Authorization', AUTH_TOKEN)
      .expect(200);
  });

  it('POST /api/v1/admin/rbac/users/:userId/roles → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/rbac/users/user-1/roles')
      .set('Authorization', AUTH_TOKEN)
      .send({ roleIds: ['role-1'] })
      .expect(201);
  });
});
