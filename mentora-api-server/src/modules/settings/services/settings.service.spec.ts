/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises */
import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Status } from '@/common/enums';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { ActivityCategory } from '@/common/enums/activity-log.enums';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import { SettingsService } from './settings.service';

const USER_ID = new Types.ObjectId().toString();
const TARGET_ID = new Types.ObjectId().toString();
const SECOND_TARGET_ID = new Types.ObjectId().toString();
const THIRD_TARGET_ID = new Types.ObjectId().toString();

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

const createRepository = () => ({
  getAllSettings: jest.fn(),
  getPrivacy: jest.fn(),
  updatePrivacy: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
  getBlockedUsers: jest.fn(),
  getBlockedRelationUserIds: jest.fn(),
  getHiddenRelationUserIds: jest.fn(),
  isBlockedBetween: jest.fn(),
  isHiddenBetween: jest.fn(),
  hideProfile: jest.fn(),
  unhideProfile: jest.fn(),
  getHiddenProfiles: jest.fn(),
  getAccount: jest.fn(),
  updateAccount: jest.fn(),
  updateAccountLifecycle: jest.fn(),
  getOrCreateUserSettings: jest.fn(),
  getOrCreateAllUserSettings: jest.fn(),
  getNotification: jest.fn(),
  updateNotification: jest.fn(),
  getCommunication: jest.fn(),
  updateCommunication: jest.fn(),
  getSecurity: jest.fn(),
  updateSecurity: jest.fn(),
  revokeDevice: jest.fn(),
  revokeAllDevices: jest.fn(),
  getLocalization: jest.fn(),
  updateLocalization: jest.fn(),
  getAccessibility: jest.fn(),
  updateAccessibility: jest.fn(),
  getMedia: jest.fn(),
  updateMedia: jest.fn(),
  getAi: jest.fn(),
  updateAi: jest.fn(),
});

const createFixture = () => {
  const repo = createRepository();
  const userModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
  };
  const userSessionModel = {
    updateMany: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };
  const verificationModel = {
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const userReportModel = { findOneAndUpdate: jest.fn() };
  const profileModel = { find: jest.fn() };
  const mediaModel = { find: jest.fn() };
  const activityLogModel = { find: jest.fn() };
  const chatRealtimeService = { emitToUser: jest.fn() };
  const socialAuthVerifierService = { verify: jest.fn() };

  const service = new SettingsService(
    repo as never,
    userModel as never,
    userSessionModel as never,
    verificationModel as never,
    userReportModel as never,
    profileModel as never,
    mediaModel as never,
    activityLogModel as never,
    chatRealtimeService as never,
    socialAuthVerifierService as never,
  );

  return {
    activityLogModel,
    chatRealtimeService,
    mediaModel,
    profileModel,
    repo,
    service,
    socialAuthVerifierService,
    userModel,
    userReportModel,
    userSessionModel,
    verificationModel,
  };
};

const configureAccountQueries = (
  fixture: ReturnType<typeof createFixture>,
  account: unknown,
  user: unknown,
  verification: unknown,
) => {
  fixture.repo.getAccount.mockResolvedValue(account);
  fixture.userModel.findById.mockReturnValue(queryChain(user));
  fixture.verificationModel.findOne.mockReturnValue(queryChain(verification));
};

const configureRelationQueries = (
  fixture: ReturnType<typeof createFixture>,
  profiles: unknown[],
  media: unknown[],
  verifications: unknown[],
) => {
  fixture.profileModel.find.mockReturnValue(queryChain(profiles));
  fixture.mediaModel.find.mockReturnValue(queryChain(media));
  fixture.verificationModel.find.mockReturnValue(queryChain(verifications));
};

describe('SettingsService', () => {
  it('combines all settings with normalized localization and account data', async () => {
    const fixture = createFixture();
    fixture.repo.getAllSettings.mockResolvedValue({
      privacy: { searchable: true },
      localization: { language: 'en', shareLocation: 1 },
    });
    configureAccountQueries(
      fixture,
      { toObject: () => ({ isDeactivated: false }) },
      {
        isEmailVerified: true,
        isPhoneVerified: false,
        authAccounts: [
          {
            provider: AuthProvider.GOOGLE,
            providerId: 'google-1',
            isVerified: true,
            isPrimary: true,
            lastUsedAt: new Date('2026-06-01T00:00:00.000Z'),
          },
          {
            provider: AuthProvider.EMAIL,
            passwordHash: 'hash',
          },
        ],
      },
      {
        status: VerificationStatus.APPROVED,
        provider: 'manual',
        verifiedAt: new Date('2026-06-02T00:00:00.000Z'),
      },
    );

    const result = await fixture.service.getAllSettings(USER_ID);

    expect(result.localization).toMatchObject({
      language: 'en',
      shareLocation: true,
    });
    expect(result.account).toMatchObject({
      isDeactivated: false,
      emailVerified: true,
      phoneVerified: false,
      profileVerification: { status: VerificationStatus.APPROVED },
    });
    expect(result.account.linkedAccounts[2]).toMatchObject({
      provider: AuthProvider.GOOGLE,
      connected: true,
      canDisconnect: false,
      isPrimary: true,
    });
  });

  it('delegates simple settings getters and updates', () => {
    const { repo, service } = createFixture();
    const dto = { enabled: true } as never;

    service.getPrivacy(USER_ID);
    service.updatePrivacy(USER_ID, dto);
    service.getOrCreateUserSettings(USER_ID);
    service.getOrCreateAllUserSettings(USER_ID);
    service.getNotification(USER_ID);
    service.getCommunication(USER_ID);
    service.updateCommunication(USER_ID, dto);
    service.getSecurity(USER_ID);
    service.revokeDevice(USER_ID, { deviceId: 'device-1' });
    service.revokeAllDevices(USER_ID);
    service.getAccessibility(USER_ID);
    service.updateAccessibility(USER_ID, dto);
    service.getMedia(USER_ID);
    service.updateMedia(USER_ID, dto);
    service.getAi(USER_ID);
    service.updateAi(USER_ID, dto);
    service.getBlockedRelationUserIds(USER_ID);
    service.isBlockedBetween(USER_ID, TARGET_ID);
    service.isHiddenBetween(USER_ID, TARGET_ID);
    service.unblockUser(USER_ID, { targetUserId: TARGET_ID });
    service.unhideProfile(USER_ID, { targetUserId: TARGET_ID });

    expect(repo.getPrivacy).toHaveBeenCalledWith(USER_ID);
    expect(repo.updatePrivacy).toHaveBeenCalledWith(USER_ID, dto);
    expect(repo.getOrCreateUserSettings).toHaveBeenCalledWith(USER_ID);
    expect(repo.getOrCreateAllUserSettings).toHaveBeenCalledWith(USER_ID);
    expect(repo.getNotification).toHaveBeenCalledWith(USER_ID);
    expect(repo.getCommunication).toHaveBeenCalledWith(USER_ID);
    expect(repo.updateCommunication).toHaveBeenCalledWith(USER_ID, dto);
    expect(repo.getSecurity).toHaveBeenCalledWith(USER_ID);
    expect(repo.revokeDevice).toHaveBeenCalledWith(USER_ID, 'device-1');
    expect(repo.revokeAllDevices).toHaveBeenCalledWith(USER_ID);
    expect(repo.getAccessibility).toHaveBeenCalledWith(USER_ID);
    expect(repo.updateAccessibility).toHaveBeenCalledWith(USER_ID, dto);
    expect(repo.getMedia).toHaveBeenCalledWith(USER_ID);
    expect(repo.updateMedia).toHaveBeenCalledWith(USER_ID, dto);
    expect(repo.getAi).toHaveBeenCalledWith(USER_ID);
    expect(repo.updateAi).toHaveBeenCalledWith(USER_ID, dto);
    expect(repo.getBlockedRelationUserIds).toHaveBeenCalledWith(USER_ID);
    expect(repo.isBlockedBetween).toHaveBeenCalledWith(USER_ID, TARGET_ID);
    expect(repo.isHiddenBetween).toHaveBeenCalledWith(USER_ID, TARGET_ID);
    expect(repo.unblockUser).toHaveBeenCalledWith(USER_ID, TARGET_ID);
    expect(repo.unhideProfile).toHaveBeenCalledWith(USER_ID, TARGET_ID);
  });

  it('rejects blocking, reporting, or hiding the current user', async () => {
    const { service } = createFixture();

    await expect(
      service.blockUser(USER_ID, { targetUserId: USER_ID }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    await expect(
      service.reportUser(USER_ID, { targetUserId: USER_ID }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    await expect(
      service.hideProfile(USER_ID, { targetUserId: USER_ID }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('blocks a user and emits realtime invalidation to both participants', async () => {
    const { chatRealtimeService, repo, service } = createFixture();
    repo.blockUser.mockResolvedValue({ _id: 'block-1' });

    await expect(
      service.blockUser(USER_ID, { targetUserId: TARGET_ID }),
    ).resolves.toEqual({ _id: 'block-1' });

    expect(chatRealtimeService.emitToUser).toHaveBeenCalledTimes(2);
    expect(chatRealtimeService.emitToUser).toHaveBeenNthCalledWith(
      1,
      USER_ID,
      'user:blocked',
      expect.objectContaining({ blockerId: USER_ID, blockedUserId: TARGET_ID }),
    );
  });

  it.each([
    [undefined, 'Reported from app'],
    ['spam', 'spam'],
  ])(
    'upserts reports with reason %s and blocks the target',
    async (reason, expected) => {
      const fixture = createFixture();
      fixture.userReportModel.findOneAndUpdate.mockResolvedValue({
        _id: 'report-1',
      });
      fixture.repo.blockUser.mockResolvedValue({ _id: 'block-1' });

      await fixture.service.reportUser(USER_ID, {
        targetUserId: TARGET_ID,
        reason,
      });

      expect(fixture.userReportModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ $set: { reason: expected } }),
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      expect(fixture.repo.blockUser).toHaveBeenCalledWith(USER_ID, TARGET_ID);
      expect(fixture.chatRealtimeService.emitToUser).toHaveBeenCalledTimes(2);
    },
  );

  it('returns empty blocked and hidden profile collections', async () => {
    const { repo, service } = createFixture();
    repo.getBlockedUsers.mockResolvedValue([]);
    repo.getHiddenProfiles.mockResolvedValue([]);

    await expect(service.getBlockedUsers(USER_ID)).resolves.toEqual({
      blockedUsers: [],
    });
    await expect(service.getHiddenProfiles(USER_ID)).resolves.toEqual({
      hiddenProfiles: [],
    });
  });

  it('enriches blocked users while preserving safe fallbacks', async () => {
    const fixture = createFixture();
    const firstId = new Types.ObjectId(TARGET_ID);
    const secondId = new Types.ObjectId(SECOND_TARGET_ID);
    const thirdId = new Types.ObjectId(THIRD_TARGET_ID);
    fixture.repo.getBlockedUsers.mockResolvedValue([
      {
        blockedUserId: firstId,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
      },
      { blockedUserId: secondId, createdAt: 'invalid' },
      { blockedUserId: thirdId },
    ]);
    configureRelationQueries(
      fixture,
      [
        {
          userId: firstId,
          personal: {
            firstName: 'Asha',
            lastName: 'Sharma',
            city: 'Mumbai',
            state: 'MH',
          },
          age: 29,
        },
      ],
      [
        {
          userId: firstId,
          thumbnailUrl: 'thumb.jpg',
          url: 'photo.jpg',
        },
        { userId: firstId, url: 'ignored.jpg' },
        { userId: secondId, url: 'fallback.jpg' },
      ],
      [{ userId: firstId, status: VerificationStatus.APPROVED }],
    );

    const result = await fixture.service.getBlockedUsers(USER_ID);

    expect(result.blockedUsers).toEqual([
      {
        userId: TARGET_ID,
        name: 'Asha Sharma',
        age: 29,
        location: 'Mumbai, MH',
        avatarUrl: 'thumb.jpg',
        verificationStatus: VerificationStatus.APPROVED,
        blockedAt: '2026-06-01T00:00:00.000Z',
      },
      {
        userId: SECOND_TARGET_ID,
        name: 'Mentora Member',
        avatarUrl: 'fallback.jpg',
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
      {
        userId: THIRD_TARGET_ID,
        name: 'Mentora Member',
        verificationStatus: VerificationStatus.NOT_STARTED,
      },
    ]);
  });

  it('enriches hidden profiles with URL, reason, and fallback variants', async () => {
    const fixture = createFixture();
    const firstId = new Types.ObjectId(TARGET_ID);
    const secondId = new Types.ObjectId(SECOND_TARGET_ID);
    fixture.repo.getHiddenProfiles.mockResolvedValue([
      {
        hiddenUserId: firstId,
        reason: 'not relevant',
        createdAt: new Date('2026-06-03T00:00:00.000Z'),
      },
      { hiddenUserId: secondId },
    ]);
    configureRelationQueries(
      fixture,
      [
        {
          userId: firstId,
          personal: { firstName: 'Ravi', city: 'Delhi' },
          age: 31,
        },
      ],
      [
        { userId: firstId, url: 'photo.jpg' },
        { userId: firstId, thumbnailUrl: 'ignored.jpg' },
      ],
      [{ userId: firstId, status: VerificationStatus.PENDING }],
    );

    const result = await fixture.service.getHiddenProfiles(USER_ID);

    expect(result.hiddenProfiles[0]).toEqual({
      userId: TARGET_ID,
      name: 'Ravi',
      age: 31,
      location: 'Delhi',
      avatarUrl: 'photo.jpg',
      verificationStatus: VerificationStatus.PENDING,
      reason: 'not relevant',
      hiddenAt: '2026-06-03T00:00:00.000Z',
    });
    expect(result.hiddenProfiles[1]).toEqual({
      userId: SECOND_TARGET_ID,
      name: 'Mentora Member',
      verificationStatus: VerificationStatus.NOT_STARTED,
    });
  });

  it('combines blocked and hidden relationship IDs without duplicates', async () => {
    const { repo, service } = createFixture();
    repo.getBlockedRelationUserIds.mockResolvedValue([
      TARGET_ID,
      SECOND_TARGET_ID,
    ]);
    repo.getHiddenRelationUserIds.mockResolvedValue([TARGET_ID]);

    await expect(
      service.getUnavailableRelationUserIds(USER_ID),
    ).resolves.toEqual([TARGET_ID, SECOND_TARGET_ID]);
  });

  it('hides another profile with an optional reason', async () => {
    const { repo, service } = createFixture();
    repo.hideProfile.mockResolvedValue({ _id: 'hide-1' });

    await service.hideProfile(USER_ID, {
      targetUserId: TARGET_ID,
      reason: 'not relevant',
    });

    expect(repo.hideProfile).toHaveBeenCalledWith(
      USER_ID,
      TARGET_ID,
      'not relevant',
    );
  });

  it('returns account fallbacks when account, user, and verification are absent', async () => {
    const fixture = createFixture();
    configureAccountQueries(fixture, null, null, null);

    const result = await fixture.service.getAccount(USER_ID);

    expect(result).toMatchObject({
      emailVerified: false,
      phoneVerified: false,
      profileVerification: {
        status: VerificationStatus.NOT_STARTED,
        provider: undefined,
        verifiedAt: undefined,
      },
    });
    expect(result.linkedAccounts).toEqual([
      expect.objectContaining({ provider: 'email', connected: false }),
      expect.objectContaining({ provider: 'phone', connected: false }),
      expect.objectContaining({ provider: 'google', connected: false }),
      expect.objectContaining({ provider: 'facebook', connected: false }),
      expect.objectContaining({ provider: 'apple', connected: false }),
    ]);
  });

  it('handles plain account data and all usable/unusable login methods', async () => {
    const fixture = createFixture();
    configureAccountQueries(
      fixture,
      { isDeactivated: true },
      {
        authAccounts: [
          { provider: AuthProvider.APPLE, isPrimary: true },
          { provider: AuthProvider.PHONE },
          { provider: AuthProvider.EMAIL },
          { provider: '', passwordHash: 'unused' },
          { provider: 'unsupported' },
        ],
      },
      null,
    );

    const result = await fixture.service.getAccount(USER_ID);

    expect((result as Record<string, unknown>).isDeactivated).toBe(true);
    expect(result.linkedAccounts[4]).toMatchObject({
      provider: AuthProvider.APPLE,
      connected: true,
      canDisconnect: false,
      isPrimary: true,
      disconnectReason: 'primary_login_method',
    });
  });

  it('marks a sole social login as non-disconnectable', async () => {
    const fixture = createFixture();
    configureAccountQueries(
      fixture,
      {},
      { authAccounts: [{ provider: AuthProvider.FACEBOOK }] },
      null,
    );

    const result = await fixture.service.getAccount(USER_ID);

    expect(result.linkedAccounts[3]).toMatchObject({
      connected: true,
      canDisconnect: false,
      disconnectReason: 'primary_login_method',
    });
  });

  it('repairs a missing primary account using the first registration method', async () => {
    const fixture = createFixture();
    const user: {
      authAccounts: Array<{
        provider: AuthProvider;
        passwordHash?: string;
        isPrimary?: boolean;
      }>;
      save: jest.Mock;
    } = {
      authAccounts: [
        { provider: AuthProvider.EMAIL, passwordHash: 'hash' },
        { provider: AuthProvider.GOOGLE },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    configureAccountQueries(fixture, {}, user, null);

    const result = await fixture.service.getAccount(USER_ID);

    expect(user.authAccounts[0].isPrimary).toBe(true);
    expect(user.authAccounts[1].isPrimary).toBeFalsy();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.linkedAccounts[0]).toMatchObject({
      provider: AuthProvider.EMAIL,
      connected: true,
      isPrimary: true,
    });
  });

  it('does not expose malformed credential rows as linked accounts', async () => {
    const fixture = createFixture();
    configureAccountQueries(
      fixture,
      {},
      { authAccounts: [{ provider: AuthProvider.EMAIL }] },
      null,
    );

    const result = await fixture.service.getAccount(USER_ID);

    expect(result.linkedAccounts[0]).toMatchObject({
      provider: AuthProvider.EMAIL,
      connected: false,
      isPrimary: false,
    });
  });

  it('deactivates an account and revokes active sessions', async () => {
    const fixture = createFixture();
    fixture.repo.updateAccount.mockResolvedValue({ isDeactivated: true });

    await fixture.service.deactivateAccount(USER_ID, {
      reason: 'taking a break',
    });

    expect(fixture.userModel.findByIdAndUpdate).toHaveBeenCalledWith(USER_ID, {
      $set: { status: Status.INACTIVE },
    });
    expect(fixture.userSessionModel.updateMany).toHaveBeenCalledWith(
      { userId: expect.any(Types.ObjectId), isActive: true },
      { $set: { isActive: false, loggedOutAt: expect.any(Date) } },
    );
    expect(fixture.repo.updateAccount).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining({
        isDeactivated: true,
        deactivationReason: 'taking a break',
      }),
    );
  });

  it('reactivates an account and clears deactivation metadata', async () => {
    const fixture = createFixture();
    fixture.repo.updateAccountLifecycle.mockResolvedValue({
      isDeactivated: false,
    });

    await fixture.service.reactivateAccount(USER_ID);

    expect(fixture.userModel.findByIdAndUpdate).toHaveBeenCalledWith(USER_ID, {
      $set: { status: Status.ACTIVE },
    });
    expect(fixture.repo.updateAccountLifecycle).toHaveBeenCalledWith(USER_ID, {
      $set: { isDeactivated: false },
      $unset: {
        deactivatedAt: '',
        deactivationReason: '',
      },
    });
  });

  it('schedules account deletion 30 days ahead and revokes sessions', async () => {
    const fixture = createFixture();
    const before = Date.now();

    await fixture.service.scheduleAccountDeletion(USER_ID);

    const update = fixture.repo.updateAccount.mock.calls[0][1] as {
      deletionScheduledAt: Date;
    };
    expect(update.deletionScheduledAt.getTime()).toBeGreaterThanOrEqual(
      before + 29 * 24 * 60 * 60 * 1000,
    );
    expect(fixture.userSessionModel.updateMany).toHaveBeenCalled();
  });

  it('cancels scheduled account deletion and keeps the account active', async () => {
    const fixture = createFixture();
    fixture.repo.updateAccountLifecycle.mockResolvedValue({});

    await fixture.service.cancelAccountDeletion(USER_ID);

    expect(fixture.userModel.findByIdAndUpdate).toHaveBeenCalledWith(USER_ID, {
      $set: { status: Status.ACTIVE },
    });
    expect(fixture.repo.updateAccountLifecycle).toHaveBeenCalledWith(USER_ID, {
      $unset: {
        deletionScheduledAt: '',
        deletionReason: '',
      },
    });
  });

  it('rejects unsupported linked-account providers and missing users', async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.disconnectLinkedAccount(USER_ID, 'twitter'),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });

    fixture.userModel.findById.mockReturnValue(queryChain(null));
    await expect(
      fixture.service.disconnectLinkedAccount(USER_ID, 'GOOGLE'),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('returns current account when the requested provider is not connected', async () => {
    const fixture = createFixture();
    const user = {
      authAccounts: [{ provider: AuthProvider.EMAIL, passwordHash: 'hash' }],
    };
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    configureAccountQueries(fixture, {}, user, null);

    const result = await fixture.service.disconnectLinkedAccount(
      USER_ID,
      AuthProvider.GOOGLE,
    );

    expect(result.linkedAccounts[2].connected).toBe(false);
  });

  it('links a provider only after server-side social-token verification', async () => {
    const fixture = createFixture();
    const user = {
      authAccounts: [
        {
          provider: AuthProvider.EMAIL,
          providerId: 'member@example.com',
          passwordHash: 'hash',
          isPrimary: true,
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.socialAuthVerifierService.verify.mockResolvedValue({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-user-1',
      email: 'member@example.com',
    });
    fixture.userModel.findOne.mockReturnValue(queryChain(null));
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    configureAccountQueries(fixture, {}, user, null);

    const result = await fixture.service.connectSocialLinkedAccount(USER_ID, {
      provider: AuthProvider.GOOGLE,
      accessToken: 'provider-token',
    });

    expect(fixture.socialAuthVerifierService.verify).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'provider-token' }),
    );
    expect(user.authAccounts[1]).toMatchObject({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-user-1',
      isPrimary: false,
      isVerified: true,
    });
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.linkedAccounts[2]).toMatchObject({
      provider: AuthProvider.GOOGLE,
      connected: true,
    });
  });

  it('rejects a social identity already owned by another user', async () => {
    const fixture = createFixture();
    fixture.socialAuthVerifierService.verify.mockResolvedValue({
      provider: AuthProvider.GOOGLE,
      providerId: 'google-user-1',
    });
    fixture.userModel.findOne.mockReturnValue(
      queryChain({ _id: new Types.ObjectId() }),
    );

    await expect(
      fixture.service.connectSocialLinkedAccount(USER_ID, {
        provider: AuthProvider.GOOGLE,
        accessToken: 'provider-token',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    expect(fixture.userModel.findById).not.toHaveBeenCalled();
  });

  it('prevents disconnecting the final usable login method', async () => {
    const fixture = createFixture();
    fixture.userModel.findById.mockReturnValue(
      queryChain({
        authAccounts: [{ provider: AuthProvider.GOOGLE }],
      }),
    );

    await expect(
      fixture.service.disconnectLinkedAccount(USER_ID, AuthProvider.GOOGLE),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('prevents disconnecting the primary login method', async () => {
    const fixture = createFixture();
    const user = {
      authAccounts: [
        { provider: AuthProvider.GOOGLE, isPrimary: true },
        { provider: AuthProvider.GOOGLE },
        { provider: AuthProvider.EMAIL, passwordHash: 'hash' },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    await expect(
      fixture.service.disconnectLinkedAccount(USER_ID, AuthProvider.GOOGLE),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
    expect(user.save).not.toHaveBeenCalled();
  });

  it('keeps an existing primary account when removing a non-primary login', async () => {
    const fixture = createFixture();
    const user = {
      authAccounts: [
        { provider: AuthProvider.FACEBOOK },
        {
          provider: AuthProvider.EMAIL,
          passwordHash: 'hash',
          isPrimary: true,
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    configureAccountQueries(fixture, {}, user, null);

    await fixture.service.disconnectLinkedAccount(
      USER_ID,
      AuthProvider.FACEBOOK,
    );

    expect(user.authAccounts[0]).toMatchObject({
      provider: AuthProvider.EMAIL,
      isPrimary: true,
    });
  });

  it('changes the primary login method to a connected usable account', async () => {
    const fixture = createFixture();
    const user = {
      authAccounts: [
        { provider: AuthProvider.GOOGLE, isPrimary: true },
        { provider: AuthProvider.EMAIL, passwordHash: 'hash' },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    configureAccountQueries(fixture, {}, user, null);

    await fixture.service.setPrimaryLinkedAccount(USER_ID, AuthProvider.EMAIL);

    expect(user.authAccounts).toEqual([
      expect.objectContaining({
        provider: AuthProvider.GOOGLE,
        isPrimary: false,
      }),
      expect.objectContaining({
        provider: AuthProvider.EMAIL,
        isPrimary: true,
      }),
    ]);
    expect(user.save).toHaveBeenCalled();
  });

  it('rejects making an unavailable login method primary', async () => {
    const fixture = createFixture();
    fixture.userModel.findById.mockReturnValue(
      queryChain({
        authAccounts: [{ provider: AuthProvider.EMAIL }],
      }),
    );

    await expect(
      fixture.service.setPrimaryLinkedAccount(USER_ID, AuthProvider.EMAIL),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('connects email-password login for the current account', async () => {
    const fixture = createFixture();
    const user: {
      email?: string;
      isEmailVerified?: boolean;
      lastPasswordChangedAt?: Date;
      authAccounts: Array<{
        provider: AuthProvider;
        providerId?: string;
        passwordHash?: string;
        isVerified?: boolean;
        isPrimary?: boolean;
      }>;
      save: jest.Mock;
    } = {
      authAccounts: [{ provider: AuthProvider.GOOGLE, isPrimary: true }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    fixture.userModel.findOne.mockReturnValue(queryChain(null));
    fixture.userModel.findById.mockReturnValueOnce(queryChain(user));
    configureAccountQueries(fixture, {}, user, null);

    const result = await fixture.service.requestEmailChange(USER_ID, {
      email: 'New@Example.com',
      password: 'Password@1234',
    });

    expect(user.email).toBe('new@example.com');
    expect(user.isEmailVerified).toBe(true);
    expect(user.lastPasswordChangedAt).toBeInstanceOf(Date);
    expect(user.authAccounts[1]).toMatchObject({
      provider: AuthProvider.EMAIL,
      providerId: 'new@example.com',
      isVerified: true,
      isPrimary: false,
    });
    expect(user.authAccounts[1].passwordHash).not.toBe('Password@1234');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.linkedAccounts[0]).toMatchObject({
      provider: AuthProvider.EMAIL,
      connected: true,
    });
  });

  it('returns the phone verification-change contract', () => {
    const { service } = createFixture();

    expect(
      service.requestPhoneChange(USER_ID, {
        countryCode: '+91',
        phone: '9999999999',
      }),
    ).toEqual({
      countryCode: '+91',
      phone: '9999999999',
      verificationRequired: true,
    });
  });

  it('flattens all notification event preferences and global toggles', () => {
    const { repo, service } = createFixture();
    const preference = { inApp: true };
    const quietHours = { enabled: true };

    service.updateNotification(USER_ID, {
      pushEnabled: true,
      sessionScheduled: preference,
      sessionReminder: preference,
      progressUpdate: preference,
      parentAlert: preference,
      messageReceived: preference,
      subscription: preference,
      marketing: preference,
      system: preference,
      quietHours,
    });

    expect(repo.updateNotification).toHaveBeenCalledWith(USER_ID, {
      pushEnabled: true,
      'preferences.sessionScheduled': preference,
      'preferences.sessionReminder': preference,
      'preferences.progressUpdate': preference,
      'preferences.parentAlert': preference,
      'preferences.messageReceived': preference,
      'preferences.subscription': preference,
      'preferences.marketing': preference,
      'preferences.system': preference,
      quietHours,
    });
  });

  it('supports notification globals only and individual channel updates', () => {
    const { repo, service } = createFixture();

    service.updateNotification(USER_ID, { pushEnabled: false });
    service.updateNotificationChannel(
      USER_ID,
      { event: 'sessionReminder', channel: 'push' } as never,
      { value: false },
    );

    expect(repo.updateNotification).toHaveBeenNthCalledWith(1, USER_ID, {
      pushEnabled: false,
    });
    expect(repo.updateNotification).toHaveBeenNthCalledWith(2, USER_ID, {
      'preferences.sessionReminder.push': false,
    });
  });

  it('removes two-factor fields from generic security updates', () => {
    const { repo, service } = createFixture();

    service.updateSecurity(USER_ID, {
      biometricEnabled: true,
      twoFactorEnabled: true,
      twoFactorMethod: 'email',
    } as never);

    expect(repo.updateSecurity).toHaveBeenCalledWith(USER_ID, {
      biometricEnabled: true,
    });
  });

  it('sets and disables an application PIN without exposing its plaintext', async () => {
    const { repo, service } = createFixture();

    await service.setAppPin(USER_ID, { pin: '1234' });
    await service.disableAppPin(USER_ID);

    const pinUpdate = repo.updateSecurity.mock.calls[0][1] as {
      appPinHash: string;
    };
    expect(pinUpdate.appPinHash).not.toBe('1234');
    expect(repo.updateSecurity).toHaveBeenNthCalledWith(2, USER_ID, {
      appPinEnabled: false,
      appPinHash: undefined,
    });
  });

  it('rejects invalid session IDs and revokes a valid owned session', async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.revokeSession(USER_ID, 'invalid'),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_ID });

    const sessionId = new Types.ObjectId().toString();
    await expect(
      fixture.service.revokeSession(USER_ID, sessionId),
    ).resolves.toEqual({ sessionId, revoked: true });
    expect(fixture.userSessionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.any(Types.ObjectId), userId: expect.any(Types.ObjectId) },
      { $set: { isActive: false, loggedOutAt: expect.any(Date) } },
    );
  });

  it('maps login sessions and authentication activity into a safe history', async () => {
    const fixture = createFixture();
    const now = Date.now();
    fixture.userSessionModel.find.mockReturnValue(
      queryChain([
        {
          _id: new Types.ObjectId(),
          isActive: true,
          loggedOutAt: new Date(),
          expiresAt: new Date(now + 60_000),
        },
        {
          _id: new Types.ObjectId(),
          isActive: true,
          expiresAt: new Date(now - 60_000),
        },
        { _id: new Types.ObjectId(), isActive: true },
        { _id: new Types.ObjectId(), isActive: false },
      ]),
    );
    fixture.activityLogModel.find.mockReturnValue(
      queryChain([
        {
          _id: new Types.ObjectId(),
          category: ActivityCategory.AUTH,
          action: 'login',
          metadata: { source: 'password' },
        },
        {
          _id: new Types.ObjectId(),
          category: ActivityCategory.AUTH,
          action: 'logout',
          metadata: null,
        },
      ]),
    );

    const result = await fixture.service.getLoginHistory(USER_ID);

    expect(result.sessions.map((item) => item.status)).toEqual([
      'signed_out',
      'expired',
      'active',
      'inactive',
    ]);
    expect(result.sessions.map((item) => item.isActive)).toEqual([
      true,
      false,
      true,
      false,
    ]);
    expect(result.timeline[0].metadata).toEqual({ source: 'password' });
    expect(result.timeline[1].metadata).toEqual({});
  });

  it('normalizes localization reads and writes for object and primitive values', async () => {
    const { repo, service } = createFixture();
    repo.getLocalization
      .mockResolvedValueOnce({ language: 'hi', shareLocation: false })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('invalid');
    repo.updateLocalization.mockResolvedValue({ shareLocation: 1 });

    await expect(service.getLocalization(USER_ID)).resolves.toEqual({
      language: 'hi',
      shareLocation: false,
    });
    await expect(service.getLocalization(USER_ID)).resolves.toEqual({
      shareLocation: false,
    });
    await expect(service.getLocalization(USER_ID)).resolves.toEqual({
      shareLocation: false,
    });
    await expect(
      service.updateLocalization(USER_ID, { language: 'en' } as never),
    ).resolves.toEqual({ shareLocation: true });
  });

  it('treats a missing authentication account as unusable', () => {
    const { service } = createFixture();
    const testableService = service as unknown as {
      isUsableAuthAccount(account?: { provider?: string }): boolean;
    };

    expect(testableService.isUsableAuthAccount()).toBe(false);
  });
});
