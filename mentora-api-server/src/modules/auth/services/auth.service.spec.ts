/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import {
  ActivityAction,
  ActivityPlatform,
} from '@/modules/profiles/enums/activity-log.enums';
import { AnalyticsPlatform } from '@/modules/analytics/enums/analytics-event.enum';
import { AuthProvider } from '../enums/auth-provider.enum';
import { DUMMY_PASSWORD_HASH } from './auth-security.constants';
import { Role, Status } from '@/common/enums';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const USER_ID = new Types.ObjectId().toString();
const SESSION_ID = new Types.ObjectId().toString();
const refreshPayload = (sub = USER_ID) => ({
  sub,
  type: 'refresh',
  sid: SESSION_ID,
  family: 'family-1',
});

const request = (overrides: Record<string, unknown> = {}) =>
  ({ headers: {}, ...overrides }) as never;

const response = () => ({ cookie: jest.fn(), clearCookie: jest.fn() });

const queryChain = (result: unknown) => {
  const chain = {
    sort: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn().mockResolvedValue(result),
  };
  chain.sort.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  return chain;
};

const createUser = (overrides: Record<string, unknown> = {}) => ({
  _id: new Types.ObjectId(USER_ID),
  email: 'asha@example.com',
  phone: { countryCode: '+91', phone: '9999999999' },
  roles: [Role.USER],
  status: Status.ACTIVE,
  isEmailVerified: true,
  isPhoneVerified: true,
  isOnboardingCompleted: false,
  authAccounts: [
    {
      provider: AuthProvider.EMAIL,
      providerId: 'asha@example.com',
      passwordHash: 'password-hash',
      isPrimary: true,
    },
  ],
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const createFixture = () => {
  const userRepo = {
    findByIdWithRoles: jest.fn(),
    findByProvider: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMembership: jest.fn(),
  };
  const jwtService = { verify: jest.fn(), sign: jest.fn() };
  const otpService = {
    generate: jest.fn(),
    verify: jest.fn(),
    shouldExposeOtpForEnvironment: jest.fn(),
  };
  const authTokenService = {
    generatePayload: jest.fn(),
    generateTokens: jest.fn(),
  };
  const cache = {
    set: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    del: jest.fn(),
    consumeIfValueMatches: jest.fn(),
  };
  const userSessionModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
  };
  const subscriptionModel = { findOneAndUpdate: jest.fn() };
  const planModel = { findOneAndUpdate: jest.fn() };
  const activityLogModel = { create: jest.fn() };
  const securitySettingModel = { findOne: jest.fn() };
  const mediaModel = { findOne: jest.fn(), create: jest.fn() };
  const userMembershipModel = {
    exists: jest.fn().mockResolvedValue(false),
    find: jest.fn().mockReturnValue(queryChain([])),
  };
  const notificationsService = {
    notify: jest.fn(),
    sendSecurityEmail: jest.fn(),
  };
  const analyticsService = { trackEvent: jest.fn() };
  const authPasswordService = {
    forgotPassword: jest.fn(),
    exchangeResetPasswordCode: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };
  const socialAuthVerifierService = { verify: jest.fn() };
  const authTwoFactorService = {
    beginChallenge: jest.fn(),
    getStatus: jest.fn(),
    setupTotp: jest.fn(),
    enableTotp: jest.fn(),
    requestSmsEnable: jest.fn(),
    enableSms: jest.fn(),
    disable: jest.fn(),
    regenerateRecoveryCodes: jest.fn(),
    consumeChallenge: jest.fn(),
  };
  const configValues: Record<string, unknown> = {
    'authMethods.emailPasswordEnabled': true,
    'authMethods.magicLinkEnabled': true,
    'authMethods.phoneOtpEnabled': true,
    'authMethods.social.google': true,
    'authMethods.social.facebook': true,
    'authMethods.social.apple': true,
    'authSecurity.maxConcurrentSessions': 5,
    'authSecurity.suspiciousLoginDetectionEnabled': true,
    'app.webUrl': 'https://app.mentora.test',
    'jwt.secret': 'access-secret-access-secret-access-secret',
    'jwt.refreshSecret': 'refresh-secret-refresh-secret-refresh',
    'jwt.audience': 'user',
    'jwt.refreshAudience': 'user-refresh',
    'jwt.issuer': 'mentora-api',
    env: 'development',
  };
  const configService = {
    get: jest.fn((key: string, fallback?: unknown) =>
      key in configValues ? configValues[key] : fallback,
    ),
    getOrThrow: jest.fn((key: string) => configValues[key]),
  };
  const referralsService = {
    validateReferralCodeForRegistration: jest.fn(),
    applyRegistrationReferral: jest.fn(),
  };

  const service = new AuthService(
    userRepo as never,
    jwtService as never,
    otpService as never,
    authTokenService as never,
    cache as never,
    userSessionModel as never,
    subscriptionModel as never,
    planModel as never,
    activityLogModel as never,
    securitySettingModel as never,
    mediaModel as never,
    userMembershipModel as never,
    notificationsService as never,
    analyticsService as never,
    authPasswordService as never,
    socialAuthVerifierService as never,
    authTwoFactorService as never,
    configService as never,
    referralsService as never,
  );

  jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
  jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
  userRepo.findByIdWithRoles.mockResolvedValue(createUser());
  userRepo.findById.mockResolvedValue(createUser());
  authTokenService.generatePayload.mockReturnValue({ sub: USER_ID });
  authTokenService.generateTokens.mockReturnValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  });
  cache.set.mockResolvedValue(undefined);
  cache.has.mockResolvedValue(true);
  cache.del.mockResolvedValue(undefined);
  cache.consumeIfValueMatches.mockResolvedValue(true);
  userSessionModel.find.mockReturnValue(queryChain([]));
  userSessionModel.create.mockResolvedValue({
    _id: new Types.ObjectId(SESSION_ID),
  });
  userSessionModel.findOneAndUpdate.mockResolvedValue({
    _id: new Types.ObjectId(SESSION_ID),
    tokenFamilyId: 'family-1',
  });
  planModel.findOneAndUpdate.mockResolvedValue({
    _id: new Types.ObjectId(),
    durationDays: 365,
  });
  activityLogModel.create.mockResolvedValue({});
  securitySettingModel.findOne.mockReturnValue(queryChain(null));
  mediaModel.findOne.mockReturnValue(queryChain(null));
  notificationsService.notify.mockResolvedValue({});
  notificationsService.sendSecurityEmail.mockResolvedValue({ status: 'sent' });
  analyticsService.trackEvent.mockResolvedValue({});
  authTwoFactorService.beginChallenge.mockResolvedValue(null);

  return {
    activityLogModel,
    analyticsService,
    authPasswordService,
    authTokenService,
    authTwoFactorService,
    cache,
    configService,
    configValues,
    jwtService,
    mediaModel,
    notificationsService,
    otpService,
    planModel,
    referralsService,
    securitySettingModel,
    service,
    socialAuthVerifierService,
    subscriptionModel,
    userMembershipModel,
    userRepo,
    userSessionModel,
  };
};

const testable = (service: AuthService) => service as any;

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('delegates two-factor and password operations', async () => {
    const f = createFixture();
    const req = request();
    await f.service.getTwoFactorStatus(USER_ID);
    await f.service.setupTotp(USER_ID);
    await f.service.enableTotp(USER_ID, '123456');
    await f.service.requestSmsTwoFactor(USER_ID);
    await f.service.enableSmsTwoFactor(USER_ID, '123456');
    await f.service.disableTwoFactor(USER_ID, '123456');
    await f.service.regenerateRecoveryCodes(USER_ID, '123456');
    await f.service.forgotPassword(req, 'a@example.com');
    await f.service.exchangeResetPasswordCode(req, 'code');
    await f.service.resetPassword(req, {} as never);
    await f.service.changePassword(req, USER_ID, {} as never);

    expect(f.authTwoFactorService.getStatus).toHaveBeenCalledWith(USER_ID);
    expect(f.authTwoFactorService.disable).toHaveBeenCalledWith(
      USER_ID,
      '123456',
    );
    expect(f.authPasswordService.forgotPassword).toHaveBeenCalled();
    expect(f.authPasswordService.changePassword).toHaveBeenCalled();
  });

  it('issues a two-factor challenge without attaching tokens', async () => {
    const f = createFixture();
    f.authTwoFactorService.beginChallenge.mockResolvedValue({
      twoFactorRequired: true,
      challengeId: 'challenge-1',
    });

    const result = await testable(f.service).issueTokensOrChallenge(
      request(),
      response(),
      createUser(),
      {
        provider: AuthProvider.EMAIL,
        source: 'login',
        userPayload: { user: { id: USER_ID } },
      },
    );

    expect(result).toMatchObject({
      user: { id: USER_ID },
      twoFactorRequired: true,
    });
    expect(f.userSessionModel.create).not.toHaveBeenCalled();
  });

  it('attaches web and mobile tokens with session rotation', async () => {
    const web = createFixture();
    const webResponse = response();
    web.userSessionModel.find
      .mockReturnValueOnce(queryChain([]))
      .mockReturnValueOnce(queryChain([]));
    await testable(web.service).attachToken(
      request({ headers: { 'x-platform': 'web' } }),
      webResponse,
      createUser(),
    );
    expect(webResponse.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );

    const mobile = createFixture();
    mobile.userSessionModel.find
      .mockReturnValueOnce(queryChain([]))
      .mockReturnValueOnce(queryChain([]));
    const result = await testable(mobile.service).attachToken(
      request({
        ip: '10.0.0.1',
        headers: {
          'x-platform': 'android',
          'x-device-id': ['device-1'],
          'user-agent': ['agent'],
        },
      }),
      response(),
      createUser(),
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      sessionId: SESSION_ID,
    });
    expect(mobile.cache.set).toHaveBeenCalledWith(
      `auth:${USER_ID}`,
      'access-token',
      900,
    );
  });

  it('rejects token attachment when role-populated user disappears', async () => {
    const f = createFixture();
    f.userRepo.findByIdWithRoles.mockResolvedValue(null);
    await expect(
      testable(f.service).attachToken(request(), response(), createUser()),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });
  });

  it('enforces concurrent-session limits and records revoked sessions', async () => {
    const f = createFixture();
    const currentId = new Types.ObjectId().toString();
    const oldOne = {
      _id: new Types.ObjectId(),
      device: 'one',
      ip: '1.1.1.1',
      userAgent: 'one',
    };
    const oldTwo = { ...oldOne, _id: new Types.ObjectId(), device: 'two' };
    f.configValues['authSecurity.maxConcurrentSessions'] = 2;
    f.userSessionModel.find.mockReturnValue(
      queryChain([
        { ...oldOne, _id: new Types.ObjectId(currentId) },
        oldOne,
        oldTwo,
      ]),
    );

    await testable(f.service).enforceConcurrentSessionLimit(USER_ID, currentId);

    expect(f.userSessionModel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: [oldTwo._id] } },
      expect.any(Object),
    );
    expect(f.activityLogModel.create).toHaveBeenCalledWith([
      expect.objectContaining({ device: 'two' }),
    ]);
  });

  it.each([0, Number.NaN])(
    'skips invalid concurrent-session limit %s',
    async (limit) => {
      const f = createFixture();
      f.configValues['authSecurity.maxConcurrentSessions'] = limit;
      await testable(f.service).enforceConcurrentSessionLimit(
        USER_ID,
        SESSION_ID,
      );
      expect(f.userSessionModel.find).not.toHaveBeenCalled();
    },
  );

  it('skips revocation when concurrent sessions fit the limit', async () => {
    const f = createFixture();
    f.userSessionModel.find.mockReturnValue(queryChain([]));
    await testable(f.service).enforceConcurrentSessionLimit(
      USER_ID,
      SESSION_ID,
    );
    expect(f.userSessionModel.updateMany).not.toHaveBeenCalled();
  });

  it('detects suspicious device/network changes and honors alert settings', async () => {
    const f = createFixture();
    f.securitySettingModel.findOne.mockReturnValue(
      queryChain({ suspiciousLoginAlerts: true, loginNotifications: false }),
    );
    await testable(f.service).detectSuspiciousLogin(
      USER_ID,
      request({ requestId: 'r1', correlationId: 'c1' }),
      {
        deviceId: 'new-device',
        ipAddress: '10.2.3.4',
        userAgent: 'agent',
        platform: 'ios',
        previousSessions: [{ device: 'old-device', ip: '10.1.1.2' }],
      },
    );
    expect(f.activityLogModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          reasons: ['new_device', 'ip_network_changed'],
        }),
      }),
    );
    expect(f.notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ['in_app'] }),
    );

    const disabled = createFixture();
    disabled.configValues['authSecurity.suspiciousLoginDetectionEnabled'] =
      false;
    await testable(disabled.service).detectSuspiciousLogin(USER_ID, request(), {
      previousSessions: [{}],
    });
    expect(disabled.securitySettingModel.findOne).not.toHaveBeenCalled();
  });

  it('skips suspicious alerts for no history, opted-out users, and known context', async () => {
    const noHistory = createFixture();
    await testable(noHistory.service).detectSuspiciousLogin(
      USER_ID,
      request(),
      { previousSessions: [] },
    );

    const optedOut = createFixture();
    optedOut.securitySettingModel.findOne.mockReturnValue(
      queryChain({ suspiciousLoginAlerts: false }),
    );
    await testable(optedOut.service).detectSuspiciousLogin(USER_ID, request(), {
      previousSessions: [{}],
    });

    const known = createFixture();
    await testable(known.service).detectSuspiciousLogin(USER_ID, request(), {
      deviceId: 'same',
      ipAddress: '10.1.1.2',
      userAgent: '',
      platform: 'web',
      previousSessions: [{ device: 'same', ip: '10.1.1.3' }],
    });
    expect(known.activityLogModel.create).not.toHaveBeenCalled();
  });

  it('refreshes and rotates web/mobile sessions', async () => {
    const f = createFixture();
    const session = {
      _id: new Types.ObjectId(SESSION_ID),
      tokenFamilyId: 'family-1',
    };
    f.jwtService.verify.mockReturnValue(refreshPayload());
    f.userSessionModel.findOne.mockResolvedValue(session);
    const res = response();
    const result = await f.service.refresh(
      request({ headers: { 'x-platform': 'web' } }),
      res as never,
      'old',
    );
    expect(f.userSessionModel.findOneAndUpdate).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalled();
    expect(result.sessionId).toBe(SESSION_ID);

    const mobile = createFixture();
    mobile.jwtService.verify.mockReturnValue(refreshPayload());
    mobile.userSessionModel.findOne.mockResolvedValue({
      ...session,
      tokenFamilyId: 'family-1',
    });
    await mobile.service.refresh(
      request({ headers: { 'x-platform': 'android' } }),
      response() as never,
      'old',
    );
    expect(response().cookie).not.toHaveBeenCalled();
  });

  it.each([
    ['missing token', request(), undefined],
    ['invalid user', request(), 'token'],
  ])('rejects refresh with %s', async (_label, req, token) => {
    const f = createFixture();
    if (token) f.jwtService.verify.mockReturnValue(refreshPayload('invalid'));
    await expect(
      f.service.refresh(req, response() as never, token),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_REFRESH_TOKEN });
  });

  it('rejects missing sessions/users and malformed refresh providers', async () => {
    const noSession = createFixture();
    noSession.jwtService.verify.mockReturnValue(refreshPayload());
    noSession.userSessionModel.findOne.mockResolvedValue(null);
    await expect(
      noSession.service.refresh(request(), response() as never, 'token'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_REFRESH_TOKEN });

    const noUser = createFixture();
    noUser.jwtService.verify.mockReturnValue(refreshPayload());
    noUser.userSessionModel.findOne.mockResolvedValue({ save: jest.fn() });
    noUser.userRepo.findByIdWithRoles.mockResolvedValue(null);
    await expect(
      noUser.service.refresh(request(), response() as never, 'token'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });

    const invalidJwt = createFixture();
    invalidJwt.jwtService.verify.mockImplementation(() => {
      throw new Error('bad jwt');
    });
    await expect(
      invalidJwt.service.refresh(request(), response() as never, 'token'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_REFRESH_TOKEN });
  });

  it('reads refresh tokens from cookies', async () => {
    const f = createFixture();
    f.jwtService.verify.mockReturnValue(refreshPayload());
    f.userSessionModel.findOne.mockResolvedValue({
      _id: new Types.ObjectId(SESSION_ID),
      tokenFamilyId: 'family-1',
    });
    await f.service.refresh(
      request({ cookies: { refreshToken: 'cookie-token' } }),
      response() as never,
    );
    expect(f.jwtService.verify).toHaveBeenCalledWith(
      'cookie-token',
      expect.objectContaining({ audience: 'user-refresh' }),
    );
  });

  it('registers email users with optional phone context', async () => {
    const f = createFixture();
    const user = createUser({ isEmailVerified: false });
    f.userRepo.findByProvider.mockResolvedValue(null);
    f.userRepo.create.mockResolvedValue(user);
    jest.spyOn(testable(f.service), 'attachToken').mockResolvedValue({
      accessToken: 'access',
    });
    jest
      .spyOn(testable(f.service), 'completeRegisterFlow')
      .mockResolvedValue(undefined);

    const result = await f.service.register(request(), response() as never, {
      email: 'ASHA@EXAMPLE.COM',
      password: 'Password@123',
      country_code: '+91',
      phone: '9999999999',
      referralCode: 'REF',
    });
    expect(f.userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'asha@example.com',
        authAccounts: [
          expect.objectContaining({ passwordHash: 'hashed-password' }),
        ],
      }),
    );
    expect(result).toMatchObject({ accessToken: 'access' });
  });

  it('rejects duplicate/disabled registrations and maps unknown failures', async () => {
    const duplicate = createFixture();
    duplicate.userRepo.findByProvider.mockResolvedValue(createUser());
    await expect(
      duplicate.service.register(request(), response() as never, {
        email: 'a@example.com',
        password: 'Password@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS });

    const disabled = createFixture();
    disabled.configValues['authMethods.emailPasswordEnabled'] = false;
    await expect(
      disabled.service.register(request(), response() as never, {
        email: 'a@example.com',
        password: 'Password@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN });

    const failed = createFixture();
    failed.referralsService.validateReferralCodeForRegistration.mockRejectedValue(
      new Error('failed'),
    );
    await expect(
      failed.service.register(request(), response() as never, {
        email: 'a@example.com',
        password: 'Password@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_UNAUTHORIZED });
  });

  it('requests magic links without leaking account existence', async () => {
    const absent = createFixture();
    absent.userRepo.findByProvider.mockResolvedValue(null);
    await expect(
      absent.service.requestMagicLink(request(), ' NONE@EXAMPLE.COM '),
    ).resolves.toEqual({ sent: true });
    expect(
      absent.notificationsService.sendSecurityEmail,
    ).not.toHaveBeenCalled();

    const found = createFixture();
    found.userRepo.findByProvider.mockResolvedValue(createUser());
    found.jwtService.sign.mockReturnValue('magic token');
    await found.service.requestMagicLink(
      request({ ip: '10.0.0.1' }),
      'ASHA@EXAMPLE.COM',
    );
    expect(found.cache.set).toHaveBeenCalledWith(
      expect.stringContaining('auth:magic-link:'),
      true,
      600,
    );
    expect(found.notificationsService.sendSecurityEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateKey: 'auth.magic_link',
        message: expect.stringContaining('magic-login?token=magic%20token'),
      }),
    );
    expect(found.notificationsService.notify).not.toHaveBeenCalled();
  });

  it('verifies magic links and rejects invalid/reused tokens', async () => {
    const success = createFixture();
    success.jwtService.verify.mockReturnValue({
      userId: USER_ID,
      type: 'magic-login',
      jti: 'jti-1',
    });
    jest
      .spyOn(testable(success.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });
    await expect(
      success.service.verifyMagicLink(request(), response() as never, 'token'),
    ).resolves.toEqual({ accessToken: 'access' });
    expect(success.cache.consumeIfValueMatches).toHaveBeenCalledWith(
      'auth:magic-link:jti-1',
      true,
    );

    for (const payload of [undefined, {}, { userId: USER_ID, type: 'wrong' }]) {
      const invalid = createFixture();
      invalid.jwtService.verify.mockReturnValue(payload);
      await expect(
        invalid.service.verifyMagicLink(
          request(),
          response() as never,
          'token',
        ),
      ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
    }

    const reused = createFixture();
    reused.jwtService.verify.mockReturnValue({
      userId: USER_ID,
      type: 'magic-login',
      jti: 'used',
    });
    reused.cache.consumeIfValueMatches.mockResolvedValue(false);
    await expect(
      reused.service.verifyMagicLink(request(), response() as never, 'token'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
  });

  it('creates the canonical free subscription', async () => {
    const f = createFixture();
    await testable(f.service).createOrUpdateFreeSubscription(USER_ID);
    expect(f.subscriptionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: expect.any(Types.ObjectId) },
      expect.objectContaining({ autoRenew: true, status: 'active' }),
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    expect(f.userRepo.updateMembership).toHaveBeenCalled();
  });

  it('logs in using the email account regardless of auth-account order', async () => {
    const f = createFixture();
    const user = createUser({
      authAccounts: [
        { provider: AuthProvider.GOOGLE },
        { provider: AuthProvider.EMAIL, passwordHash: 'email-hash' },
      ],
    });
    f.userRepo.findByProvider.mockResolvedValue(user);
    jest
      .spyOn(testable(f.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });

    await f.service.login(request(), response() as never, {
      email: 'ASHA@EXAMPLE.COM',
      password: 'Password@123',
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('Password@123', 'email-hash');
  });

  it('performs dummy password work for unknown email accounts', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(null);

    await expect(
      f.service.login(request(), response() as never, {
        email: 'missing@example.com',
        password: 'legacy-password',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_CREDENTIALS });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'legacy-password',
      DUMMY_PASSWORD_HASH,
    );
  });

  it('rejects missing users/passwords and invalid password logins', async () => {
    for (const user of [
      null,
      createUser({ authAccounts: [{ provider: AuthProvider.EMAIL }] }),
    ]) {
      const f = createFixture();
      f.userRepo.findByProvider.mockResolvedValue(user);
      await expect(
        f.service.login(request(), response() as never, {
          email: 'a@example.com',
          password: 'wrong',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_CREDENTIALS });
    }

    const bad = createFixture();
    bad.userRepo.findByProvider.mockResolvedValue(createUser());
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
    await expect(
      bad.service.login(request(), response() as never, {
        email: 'a@example.com',
        password: 'wrong',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_CREDENTIALS });
  });

  it('rejects a plain "user" role on the admin CRM login surface', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(
      createUser({ roles: [Role.USER] }),
    );

    await expect(
      f.service.login(
        request(),
        response() as never,
        { email: 'asha@example.com', password: 'Password@123' },
        { surface: 'admin' },
      ),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN });
  });

  it('allows a staff role on the admin CRM login surface', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(
      createUser({ roles: [Role.ADMIN] }),
    );
    jest
      .spyOn(testable(f.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });

    await expect(
      f.service.login(
        request(),
        response() as never,
        { email: 'asha@example.com', password: 'Password@123' },
        { surface: 'admin' },
      ),
    ).resolves.toEqual({ accessToken: 'access' });
  });

  it('does not gate the regular app login surface by CRM role', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(
      createUser({ roles: [Role.USER] }),
    );
    jest
      .spyOn(testable(f.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });

    await expect(
      f.service.login(request(), response() as never, {
        email: 'asha@example.com',
        password: 'Password@123',
      }),
    ).resolves.toEqual({ accessToken: 'access' });
  });

  it('allows an organization member with no platform role onto the admin CRM surface', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(
      createUser({ roles: [Role.ORG_STAFF] }),
    );
    f.userMembershipModel.exists.mockResolvedValue(true);
    jest
      .spyOn(testable(f.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });

    await expect(
      f.service.login(
        request(),
        response() as never,
        { email: 'asha@example.com', password: 'Password@123' },
        { surface: 'admin' },
      ),
    ).resolves.toEqual({ accessToken: 'access' });
  });

  it('rejects an organization-only staff role (no mobile surface) on the app login surface', async () => {
    const f = createFixture();
    f.userRepo.findByProvider.mockResolvedValue(
      createUser({ roles: [Role.ORG_STAFF] }),
    );
    f.userMembershipModel.find.mockReturnValue(
      queryChain([{ role: 'branch_admin' }]),
    );

    await expect(
      f.service.login(request(), response() as never, {
        email: 'asha@example.com',
        password: 'Password@123',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN });
  });

  it('allows dual-surface org roles (counselor, mentor) onto the app login surface', async () => {
    for (const role of ['admission_counselor', 'mentor']) {
      const f = createFixture();
      f.userRepo.findByProvider.mockResolvedValue(
        createUser({ roles: [Role.ORG_STAFF] }),
      );
      f.userMembershipModel.find.mockReturnValue(queryChain([{ role }]));
      jest
        .spyOn(testable(f.service), 'issueTokensOrChallenge')
        .mockResolvedValue({ accessToken: 'access' });

      await expect(
        f.service.login(request(), response() as never, {
          email: 'asha@example.com',
          password: 'Password@123',
        }),
      ).resolves.toEqual({ accessToken: 'access' });
    }
  });

  it('sends OTP with environment-sensitive exposure', async () => {
    const exposed = createFixture();
    exposed.otpService.generate.mockResolvedValue('123456');
    exposed.otpService.shouldExposeOtpForEnvironment.mockReturnValue(true);
    await expect(exposed.service.sendOtp('+91', '999')).resolves.toEqual({
      phone: '999',
      otp: '123456',
    });

    const hidden = createFixture();
    hidden.otpService.generate.mockResolvedValue('123456');
    hidden.otpService.shouldExposeOtpForEnvironment.mockReturnValue(false);
    await expect(hidden.service.sendOtp('+91', '999')).resolves.toEqual({
      phone: '999',
    });
  });

  it('verifies existing and new phone users', async () => {
    const existing = createFixture();
    existing.otpService.verify.mockReturnValue(true);
    existing.userRepo.findByProvider.mockResolvedValue(
      createUser({ isPhoneVerified: false }),
    );
    jest
      .spyOn(testable(existing.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });
    await existing.service.verifyOtp(
      request(),
      response() as never,
      '+91',
      '999',
      '123456',
    );
    expect(existing.userRepo.update).toHaveBeenCalledWith(USER_ID, {
      isPhoneVerified: true,
    });
    expect(existing.userRepo.findByProvider).toHaveBeenCalledWith(
      AuthProvider.PHONE,
      '91|999',
    );

    const fresh = createFixture();
    fresh.otpService.verify.mockReturnValue(true);
    fresh.userRepo.findByProvider.mockResolvedValue(null);
    fresh.userRepo.create.mockResolvedValue(createUser());
    jest
      .spyOn(testable(fresh.service), 'completeRegisterFlow')
      .mockResolvedValue(undefined);
    jest.spyOn(testable(fresh.service), 'attachToken').mockResolvedValue({});
    await fresh.service.verifyOtp(
      request(),
      response() as never,
      '+91',
      '999',
      '123456',
      'REF',
    );
    expect(fresh.userRepo.create).toHaveBeenCalled();
    expect(fresh.userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: { countryCode: '91', phone: '999' },
        authAccounts: [expect.objectContaining({ providerId: '91|999' })],
      }),
    );
  });

  it('rejects invalid OTP and maps unexpected OTP failures', async () => {
    const invalid = createFixture();
    invalid.otpService.verify.mockReturnValue(false);
    await expect(
      invalid.service.verifyOtp(
        request(),
        response() as never,
        '+91',
        '999',
        'bad',
      ),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_OTP });

    const failed = createFixture();
    failed.otpService.verify.mockImplementation(() => {
      throw new Error('failed');
    });
    await expect(
      failed.service.verifyOtp(
        request(),
        response() as never,
        '+91',
        '999',
        '123',
      ),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_UNAUTHORIZED });
  });

  it('verifies users and enforces account status', async () => {
    const active = createFixture();
    await expect(active.service.verifyUser(USER_ID)).resolves.toMatchObject({
      userId: expect.any(Types.ObjectId),
    });

    for (const status of [Status.BLOCKED, Status.SUSPENDED, Status.DELETED]) {
      const f = createFixture();
      f.userRepo.findById.mockResolvedValue(createUser({ status }));
      await expect(f.service.verifyUser(USER_ID)).rejects.toMatchObject({
        code:
          status === Status.DELETED
            ? ErrorCode.AUTH_ACCOUNT_DELETED
            : ErrorCode.AUTH_ACCOUNT_BLOCKED,
      });
    }
  });

  it('logs out current, all, and selected sessions', async () => {
    const current = createFixture();
    current.userSessionModel.findOne.mockResolvedValue({
      _id: new Types.ObjectId(SESSION_ID),
      userId: new Types.ObjectId(USER_ID),
    });
    jest
      .spyOn(testable(current.service), 'completeLogoutFlow')
      .mockResolvedValue(undefined);
    await expect(current.service.logout(request(), 'refresh')).resolves.toEqual(
      {
        success: true,
      },
    );

    const all = createFixture();
    jest
      .spyOn(testable(all.service), 'completeLogoutFlow')
      .mockResolvedValue(undefined);
    await expect(all.service.logoutAll(request(), USER_ID)).resolves.toEqual({
      success: true,
    });

    const selected = createFixture();
    selected.userSessionModel.findOneAndUpdate.mockResolvedValue({});
    jest
      .spyOn(testable(selected.service), 'completeLogoutFlow')
      .mockResolvedValue(undefined);
    await expect(
      selected.service.logoutSession(request(), USER_ID, SESSION_ID),
    ).resolves.toEqual({ success: true });
  });

  it('rejects invalid logout/session requests', async () => {
    const f = createFixture();
    await expect(f.service.logout(request(), '')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
    });
    f.userSessionModel.findOne.mockResolvedValue(null);
    await expect(f.service.logout(request(), 'missing')).rejects.toMatchObject({
      code: ErrorCode.AUTH_SESSION_EXPIRED,
    });
    await expect(
      f.service.logoutAll(request(), 'invalid'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_TOKEN,
    });
    await expect(
      f.service.logoutSession(request(), USER_ID, 'invalid'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
    f.userSessionModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(
      f.service.logoutSession(request(), USER_ID, SESSION_ID),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_SESSION_EXPIRED });
  });

  it('lists active sessions and infers client platforms', async () => {
    const f = createFixture();
    f.userSessionModel.find.mockReturnValue(
      queryChain([
        {
          _id: new Types.ObjectId(),
          userAgent: 'Android',
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          userAgent: 'iPhone',
          createdAt: new Date(),
        },
        { _id: new Types.ObjectId(), userAgent: 'Windows' },
        { _id: new Types.ObjectId(), userAgent: 'Macintosh' },
        { _id: new Types.ObjectId(), userAgent: undefined },
      ]),
    );
    const result = await f.service.listSessions(USER_ID);
    expect(result.sessions.map((item) => item.platform)).toEqual([
      'android',
      'ios',
      'windows',
      'macos',
      'unknown',
    ]);
    await expect(f.service.listSessions('invalid')).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_TOKEN,
    });
  });

  it('configures secure cookies for development and production', () => {
    const dev = createFixture();
    expect(dev.service.getRefreshCookieOptions()).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    const prod = createFixture();
    prod.configValues.env = 'production';
    prod.configValues['app.cookieDomain'] = '.mentora.test';
    expect(prod.service.getRefreshCookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      domain: '.mentora.test',
    });
  });

  it('normalizes providers, platforms, IP networks, headers, and cookies', () => {
    const f = createFixture();
    const s = testable(f.service);
    expect(s.resolveProvider(createUser())).toBe(AuthProvider.EMAIL);
    expect(
      s.resolveProvider({
        authAccounts: [
          { provider: AuthProvider.GOOGLE },
          { provider: AuthProvider.APPLE, isPrimary: true },
        ],
      }),
    ).toBe(AuthProvider.APPLE);
    expect(s.resolveProvider({})).toBe(AuthProvider.EMAIL);
    expect(s.toAnalyticsPlatform('IOS')).toBe(AnalyticsPlatform.IOS);
    expect(s.toAnalyticsPlatform('desktop')).toBe(AnalyticsPlatform.WEB);
    expect(s.toActivityPlatform('android')).toBe(ActivityPlatform.ANDROID);
    expect(s.getIpNetwork('192.168.1.4')).toBe('192.168.1');
    expect(s.getIpNetwork('2001:db8:1:2::1')).toBe('2001:db8:1:2');
    expect(s.getIpNetwork('invalid')).toBe('invalid');
    expect(s.getIpNetwork()).toBeUndefined();
    const req = request({
      cookies: { refreshToken: 'cookie' },
      headers: { direct: 'value', array: ['first'], invalid: [42] },
    });
    expect(s.getHeaderString(req, 'direct')).toBe('value');
    expect(s.getHeaderString(req, 'array')).toBe('first');
    expect(s.getHeaderString(req, 'invalid')).toBeUndefined();
    expect(s.getCookieString(req, 'refreshToken')).toBe('cookie');
    expect(s.getCookieString(request(), 'refreshToken')).toBeUndefined();
    expect(
      s.getCookieString(
        request({ cookies: { refreshToken: 42 } }),
        'refreshToken',
      ),
    ).toBeUndefined();
  });

  it('synchronizes social photos only when needed', async () => {
    const invalid = createFixture();
    await testable(invalid.service).syncSocialProfilePhoto(
      'invalid',
      'photo.jpg',
    );
    await testable(invalid.service).syncSocialProfilePhoto(USER_ID, undefined);
    expect(invalid.mediaModel.findOne).not.toHaveBeenCalled();

    const existing = createFixture();
    existing.mediaModel.findOne.mockReturnValue(queryChain({ _id: 'media' }));
    await testable(existing.service).syncSocialProfilePhoto(
      USER_ID,
      'photo.jpg',
    );
    expect(existing.mediaModel.create).not.toHaveBeenCalled();

    const fresh = createFixture();
    await testable(fresh.service).syncSocialProfilePhoto(USER_ID, 'photo.jpg');
    expect(fresh.mediaModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'photo.jpg', isPrimary: true }),
    );
  });

  it('rejects disabled and unsupported social providers', () => {
    const f = createFixture();
    f.configValues['authMethods.social.google'] = false;
    expect(() =>
      s(f).assertSocialProviderEnabled(AuthProvider.GOOGLE),
    ).toThrow();
    expect(() =>
      s(f).assertSocialProviderEnabled(AuthProvider.EMAIL),
    ).toThrow();
  });
});

const s = (fixture: ReturnType<typeof createFixture>) =>
  testable(fixture.service);

describe('AuthService remaining lifecycle flows', () => {
  beforeEach(() => jest.clearAllMocks());

  it('completes non-2FA and successful 2FA authentication', async () => {
    const direct = createFixture();
    jest
      .spyOn(testable(direct.service), 'completeLoginFlow')
      .mockResolvedValue(undefined);
    jest.spyOn(testable(direct.service), 'attachToken').mockResolvedValue({
      accessToken: 'access',
    });
    await expect(
      testable(direct.service).issueTokensOrChallenge(
        request(),
        response(),
        createUser(),
        {
          provider: AuthProvider.EMAIL,
          source: 'login',
          userPayload: { user: { id: USER_ID } },
        },
      ),
    ).resolves.toEqual({ user: { id: USER_ID }, accessToken: 'access' });

    const twoFactor = createFixture();
    twoFactor.authTwoFactorService.consumeChallenge.mockResolvedValue({
      userId: USER_ID,
      provider: AuthProvider.EMAIL,
      source: 'login',
    });
    jest
      .spyOn(testable(twoFactor.service), 'completeLoginFlow')
      .mockResolvedValue(undefined);
    jest.spyOn(testable(twoFactor.service), 'attachToken').mockResolvedValue({
      accessToken: 'access',
    });
    await expect(
      twoFactor.service.verifyTwoFactorChallenge(
        request(),
        response() as never,
        { challengeId: 'challenge', code: '123456' },
      ),
    ).resolves.toMatchObject({ accessToken: 'access' });

    const missing = createFixture();
    missing.authTwoFactorService.consumeChallenge.mockResolvedValue({
      userId: USER_ID,
      provider: AuthProvider.EMAIL,
      source: 'login',
    });
    missing.userRepo.findById.mockResolvedValue(null);
    await expect(
      missing.service.verifyTwoFactorChallenge(request(), response() as never, {
        challengeId: 'challenge',
        recoveryCode: 'recovery',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });
  });

  it('executes register, login, refresh, logout, and post-register helpers', async () => {
    const f = createFixture();
    const req = request({
      headers: {
        'x-forwarded-for': '10.0.0.1',
        'x-device-id': 'device',
        'user-agent': 'agent',
        'x-platform': 'ios',
      },
    });
    await testable(f.service).completeRegisterFlow(req, USER_ID, {
      provider: AuthProvider.EMAIL,
      source: 'register',
      hasEmail: false,
      phone: { countryCode: '+91', phone: '999' },
      sendOtp: true,
      context: { platform: ActivityPlatform.IOS },
    });
    await testable(f.service).completeLoginFlow(req, USER_ID, {
      provider: AuthProvider.EMAIL,
      source: 'login',
    });
    await testable(f.service).completeRefreshFlow(req, USER_ID, {
      provider: AuthProvider.EMAIL,
      source: 'refresh',
    });
    await testable(f.service).completeLogoutFlow(req, USER_ID, {
      source: 'logout',
      action: ActivityAction.LOGOUT,
    });
    await testable(f.service).triggerPostRegisterJobs(USER_ID, req, {
      provider: AuthProvider.EMAIL,
      source: 'without-otp',
      hasEmail: true,
      platform: ActivityPlatform.WEB,
      sendOtp: false,
    });
    expect(f.activityLogModel.create).toHaveBeenCalledTimes(4);
    expect(f.otpService.generate).toHaveBeenCalledWith('+91', '999');
    expect(f.notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ['in_app', 'email'] }),
    );
  });

  it('covers magic-link missing-user and malformed-token failures', async () => {
    const missing = createFixture();
    missing.jwtService.verify.mockReturnValue({
      userId: USER_ID,
      type: 'magic-login',
      jti: 'jti',
    });
    missing.userRepo.findById.mockResolvedValue(null);
    await expect(
      missing.service.verifyMagicLink(request(), response() as never, 'token'),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_USER_NOT_FOUND });

    const malformed = createFixture();
    malformed.jwtService.verify.mockImplementation(() => {
      throw new Error('bad token');
    });
    await expect(
      malformed.service.verifyMagicLink(
        request(),
        response() as never,
        'token',
      ),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_INVALID_TOKEN });
  });

  it('handles existing, linked-email, and new social users', async () => {
    const verified = {
      provider: AuthProvider.GOOGLE,
      providerId: 'google-1',
      email: 'asha@example.com',
      profilePhoto: 'photo.jpg',
    };
    const existing = createFixture();
    existing.socialAuthVerifierService.verify.mockResolvedValue(verified);
    existing.userRepo.findByProvider.mockResolvedValue(createUser());
    jest
      .spyOn(testable(existing.service), 'syncSocialProfilePhoto')
      .mockResolvedValue(undefined);
    jest
      .spyOn(testable(existing.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });
    await existing.service.socialLogin(request(), response() as never, {
      provider: AuthProvider.GOOGLE,
      accessToken: 'token',
    });

    const linked = createFixture();
    const emailUser = createUser();
    linked.socialAuthVerifierService.verify.mockResolvedValue(verified);
    linked.userRepo.findByProvider.mockResolvedValue(null);
    linked.userRepo.findByEmail.mockResolvedValue(emailUser);
    jest
      .spyOn(testable(linked.service), 'syncSocialProfilePhoto')
      .mockResolvedValue(undefined);
    jest
      .spyOn(testable(linked.service), 'issueTokensOrChallenge')
      .mockResolvedValue({ accessToken: 'access' });
    await linked.service.socialLogin(request(), response() as never, {
      provider: AuthProvider.GOOGLE,
      accessToken: 'token',
    });
    expect(emailUser.save).toHaveBeenCalled();

    const fresh = createFixture();
    fresh.socialAuthVerifierService.verify.mockResolvedValue({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-2',
    });
    fresh.userRepo.findByProvider.mockResolvedValue(null);
    fresh.userRepo.create.mockResolvedValue(createUser({ email: undefined }));
    jest
      .spyOn(testable(fresh.service), 'completeRegisterFlow')
      .mockResolvedValue(undefined);
    jest
      .spyOn(testable(fresh.service), 'syncSocialProfilePhoto')
      .mockResolvedValue(undefined);
    jest.spyOn(testable(fresh.service), 'attachToken').mockResolvedValue({});
    await fresh.service.socialLogin(request(), response() as never, {
      provider: AuthProvider.GOOGLE,
      accessToken: 'token',
    });
    expect(fresh.userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: undefined, isEmailVerified: false }),
    );
  });

  it('maps unexpected login/social errors and missing verification users', async () => {
    const login = createFixture();
    login.userRepo.findByProvider.mockRejectedValue(new Error('failed'));
    await expect(
      login.service.login(request(), response() as never, {
        email: 'a@example.com',
        password: 'password',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_UNAUTHORIZED });

    const social = createFixture();
    social.socialAuthVerifierService.verify.mockRejectedValue(new Error('bad'));
    await expect(
      social.service.socialLogin(request(), response() as never, {
        provider: AuthProvider.GOOGLE,
        accessToken: 'token',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_UNAUTHORIZED });

    const missing = createFixture();
    missing.userRepo.findById.mockResolvedValue(null);
    await expect(missing.service.verifyUser(USER_ID)).rejects.toMatchObject({
      code: ErrorCode.AUTH_USER_NOT_FOUND,
    });
    const failed = createFixture();
    failed.userRepo.findById.mockRejectedValue(new Error('failed'));
    await expect(failed.service.verifyUser(USER_ID)).rejects.toMatchObject({
      code: ErrorCode.AUTH_UNAUTHORIZED,
    });
  });

  it('rejects invalid session ownership and covers enabled social config', async () => {
    const invalid = createFixture();
    invalid.userSessionModel.findOne.mockResolvedValue({
      _id: new Types.ObjectId(),
      userId: 'invalid',
    });
    await expect(
      invalid.service.logout(request(), 'refresh'),
    ).rejects.toMatchObject({
      code: ErrorCode.AUTH_INVALID_TOKEN,
    });

    const enabled = createFixture();
    expect(() =>
      testable(enabled.service).assertSocialProviderEnabled(
        AuthProvider.GOOGLE,
      ),
    ).not.toThrow();
    expect(
      testable(enabled.service).getIpNetwork(' , 10.0.0.1'),
    ).toBeUndefined();
  });

  it('covers remaining authentication fallback branches', async () => {
    const attach = createFixture();
    attach.userSessionModel.find
      .mockReturnValueOnce(queryChain([]))
      .mockReturnValueOnce(queryChain([]));
    await testable(attach.service).attachToken(
      request(),
      response(),
      createUser(),
    );

    const alert = createFixture();
    alert.notificationsService.notify.mockRejectedValue(new Error('down'));
    await testable(alert.service).detectSuspiciousLogin(USER_ID, request(), {
      deviceId: 'new',
      ipAddress: '10.2.1.1',
      userAgent: 'agent',
      platform: 'web',
      previousSessions: [{ device: 'old', ip: '10.1.1.1' }],
    });
    await Promise.resolve();
    expect(alert.notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({ channels: ['in_app', 'email'] }),
    );

    const register = createFixture();
    register.userRepo.findByProvider.mockResolvedValue(null);
    register.userRepo.create.mockResolvedValue(createUser());
    jest
      .spyOn(testable(register.service), 'completeRegisterFlow')
      .mockResolvedValue(undefined);
    jest.spyOn(testable(register.service), 'attachToken').mockResolvedValue({});
    await register.service.register(request(), response() as never, {
      email: 'a@example.com',
      password: 'Password@123',
    });

    const magic = createFixture();
    magic.userRepo.findByProvider.mockResolvedValue(createUser());
    magic.jwtService.sign.mockReturnValue('token');
    await magic.service.requestMagicLink(
      request({ headers: { 'x-forwarded-for': '10.0.0.1' } }),
      'a@example.com',
    );
    expect(
      testable(magic.service).resolveProvider({
        authAccounts: [{ provider: AuthProvider.FACEBOOK }],
      }),
    ).toBe(AuthProvider.FACEBOOK);

    const verifiedPhone = createFixture();
    verifiedPhone.otpService.verify.mockReturnValue(true);
    verifiedPhone.userRepo.findByProvider.mockResolvedValue(
      createUser({ isPhoneVerified: true }),
    );
    jest
      .spyOn(testable(verifiedPhone.service), 'issueTokensOrChallenge')
      .mockResolvedValue({});
    await verifiedPhone.service.verifyOtp(
      request(),
      response() as never,
      '+91',
      '999',
      '123456',
    );
    expect(verifiedPhone.userRepo.update).not.toHaveBeenCalled();

    const disabledSocial = createFixture();
    disabledSocial.configValues['authMethods.social.google'] = false;
    await expect(
      disabledSocial.service.socialLogin(request(), response() as never, {
        provider: AuthProvider.GOOGLE,
        accessToken: 'token',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_FORBIDDEN });
  });
});
