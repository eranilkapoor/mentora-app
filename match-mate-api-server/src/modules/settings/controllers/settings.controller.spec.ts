import { SuccessCode } from '@/common/constants';
import { SettingsController } from './settings.controller';

describe('SettingsController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId }, headers: {}, ip: '127.0.0.1' } as never;

  const settingsService = {
    getAllSettings: jest.fn(),
    getPrivacy: jest.fn(),
    updatePrivacy: jest.fn(),
    getBlockedUsers: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    reportUser: jest.fn(),
    getHiddenProfiles: jest.fn(),
    hideProfile: jest.fn(),
    unhideProfile: jest.fn(),
    getAccount: jest.fn(),
    deactivateAccount: jest.fn(),
    scheduleAccountDeletion: jest.fn(),
    disconnectLinkedAccount: jest.fn(),
    setPrimaryLinkedAccount: jest.fn(),
    requestEmailChange: jest.fn(),
    requestPhoneChange: jest.fn(),
    getNotification: jest.fn(),
    updateNotification: jest.fn(),
    updateNotificationChannel: jest.fn(),
    getCommunication: jest.fn(),
    updateCommunication: jest.fn(),
    getSecurity: jest.fn(),
    updateSecurity: jest.fn(),
    setAppPin: jest.fn(),
    disableAppPin: jest.fn(),
    revokeDevice: jest.fn(),
    revokeAllDevices: jest.fn(),
    getLoginHistory: jest.fn(),
    revokeSession: jest.fn(),
    getLocalization: jest.fn(),
    updateLocalization: jest.fn(),
    getAccessibility: jest.fn(),
    updateAccessibility: jest.fn(),
    getMedia: jest.fn(),
    updateMedia: jest.fn(),
    getAi: jest.fn(),
    updateAi: jest.fn(),
  };

  const dataExportService = {
    exportUserData: jest.fn(),
  };

  const consentService = {
    getConsents: jest.fn(),
    recordConsent: jest.fn(),
  };

  let controller: SettingsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SettingsController(
      settingsService as never,
      dataExportService as never,
      consentService as never,
    );
  });

  it('gets and updates privacy settings for current user', async () => {
    settingsService.getPrivacy.mockResolvedValue({ profileVisibility: 'all' });
    settingsService.updatePrivacy.mockResolvedValue({
      profileVisibility: 'matches',
    });

    const fetched = await controller.getPrivacy(req);
    const updated = await controller.updatePrivacy(req, {
      profileVisibility: 'matches',
    } as never);

    expect(settingsService.getPrivacy).toHaveBeenCalledWith(userId);
    expect(settingsService.updatePrivacy).toHaveBeenCalledWith(userId, {
      profileVisibility: 'matches',
    });
    expect(fetched.code).toBe(SuccessCode.SETTINGS_FETCHED);
    expect(updated.code).toBe(SuccessCode.SETTINGS_UPDATED);
  });

  it('exports user data for account privacy endpoint', async () => {
    dataExportService.exportUserData.mockResolvedValue({ exportedAt: 'now' });

    const response = await controller.downloadDataExport(req);

    expect(dataExportService.exportUserData).toHaveBeenCalledWith(userId);
    expect(response.code).toBe(SuccessCode.SETTINGS_FETCHED);
  });

  it('records user consent with normalized user-agent and client ip', async () => {
    const consentReq = {
      user: { sub: userId },
      ip: '10.0.0.1',
      headers: { 'user-agent': ['matchmate-ios/1.0'] },
    } as never;
    consentService.recordConsent.mockResolvedValue({ id: 'consent-1' });

    const response = await controller.recordConsent(consentReq, {
      type: 'privacy_policy',
      version: 'v1',
      accepted: true,
      source: 'app',
    } as never);

    expect(consentService.recordConsent).toHaveBeenCalledWith(
      userId,
      {
        type: 'privacy_policy',
        version: 'v1',
        accepted: true,
        source: 'app',
      },
      {
        ip: '10.0.0.1',
        userAgent: 'matchmate-ios/1.0',
      },
    );
    expect(response.code).toBe(SuccessCode.SETTINGS_UPDATED);
  });

  it('revokes a single device for authenticated user', async () => {
    settingsService.revokeDevice.mockResolvedValue({ success: true });

    const response = await controller.revokeDevice(req, 'device-123');

    expect(settingsService.revokeDevice).toHaveBeenCalledWith(userId, {
      deviceId: 'device-123',
    });
    expect(response.code).toBe(SuccessCode.SETTINGS_DEVICE_REVOKED);
  });

  it.each([
    ['getAllSettings', 'getAllSettings', [], SuccessCode.SETTINGS_FETCHED],
    ['getBlockedUsers', 'getBlockedUsers', [], SuccessCode.SETTINGS_FETCHED],
    [
      'blockUser',
      'blockUser',
      [{ userId: 'user-2' }],
      SuccessCode.USER_BLOCKED,
    ],
    [
      'unblockUser',
      'unblockUser',
      [{ userId: 'user-2' }],
      SuccessCode.USER_UNBLOCKED,
    ],
    [
      'reportUser',
      'reportUser',
      [{ userId: 'user-2', reason: 'spam' }],
      SuccessCode.USER_REPORTED,
    ],
    [
      'getHiddenProfiles',
      'getHiddenProfiles',
      [],
      SuccessCode.SETTINGS_FETCHED,
    ],
    [
      'hideProfile',
      'hideProfile',
      [{ userId: 'user-2' }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    [
      'unhideProfile',
      'unhideProfile',
      [{ userId: 'user-2' }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getAccount', 'getAccount', [], SuccessCode.SETTINGS_FETCHED],
    [
      'deactivateAccount',
      'deactivateAccount',
      [{ reason: 'taking_a_break' }],
      SuccessCode.SETTINGS_ACCOUNT_DEACTIVATED,
    ],
    [
      'scheduleAccountDeletion',
      'scheduleAccountDeletion',
      [],
      SuccessCode.SETTINGS_ACCOUNT_DELETION_SCHEDULED,
    ],
    [
      'disconnectLinkedAccount',
      'disconnectLinkedAccount',
      ['facebook'],
      SuccessCode.SETTINGS_ACCOUNT_UNLINKED,
    ],
    [
      'setPrimaryLinkedAccount',
      'setPrimaryLinkedAccount',
      ['email'],
      SuccessCode.SETTINGS_UPDATED,
    ],
    [
      'requestEmailChange',
      'requestEmailChange',
      [{ email: 'new@example.com' }],
      SuccessCode.SETTINGS_ACCOUNT_CHANGE_REQUESTED,
    ],
    [
      'requestPhoneChange',
      'requestPhoneChange',
      [{ phone: '+919999999999' }],
      SuccessCode.SETTINGS_ACCOUNT_CHANGE_REQUESTED,
    ],
    ['getNotification', 'getNotification', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateNotification',
      'updateNotification',
      [{ pushEnabled: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    [
      'updateNotificationChannel',
      'updateNotificationChannel',
      [{ event: 'match', channel: 'push' }, { enabled: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getCommunication', 'getCommunication', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateCommunication',
      'updateCommunication',
      [{ readReceipts: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getSecurity', 'getSecurity', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateSecurity',
      'updateSecurity',
      [{ loginAlerts: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['setAppPin', 'setAppPin', [{ pin: '1234' }], SuccessCode.SETTINGS_UPDATED],
    ['disableAppPin', 'disableAppPin', [], SuccessCode.SETTINGS_UPDATED],
    [
      'revokeAllDevices',
      'revokeAllDevices',
      [],
      SuccessCode.SETTINGS_DEVICE_REVOKED,
    ],
    [
      'getLoginHistory',
      'getLoginHistory',
      [],
      SuccessCode.SETTINGS_LOGIN_HISTORY_FETCHED,
    ],
    [
      'revokeSession',
      'revokeSession',
      ['session-1'],
      SuccessCode.SETTINGS_DEVICE_REVOKED,
    ],
    ['getLocalization', 'getLocalization', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateLocalization',
      'updateLocalization',
      [{ language: 'hi' }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getAccessibility', 'getAccessibility', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateAccessibility',
      'updateAccessibility',
      [{ highContrast: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getMedia', 'getMedia', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateMedia',
      'updateMedia',
      [{ videoAutoplay: false }],
      SuccessCode.SETTINGS_UPDATED,
    ],
    ['getAi', 'getAi', [], SuccessCode.SETTINGS_FETCHED],
    [
      'updateAi',
      'updateAi',
      [{ recommendationsEnabled: true }],
      SuccessCode.SETTINGS_UPDATED,
    ],
  ])(
    'routes %s to SettingsService.%s',
    async (controllerMethod, serviceMethod, args, successCode) => {
      const serviceFns: Record<string, jest.Mock> = settingsService;
      const serviceFn = serviceFns[serviceMethod];
      serviceFn.mockResolvedValue({ operation: serviceMethod });
      const method = controller[
        controllerMethod as keyof SettingsController
      ] as (...params: unknown[]) => Promise<{ code: SuccessCode }>;

      const response = await method.call(controller, req, ...args);

      expect(serviceFn).toHaveBeenCalledWith(userId, ...args);
      expect(response.code).toBe(successCode);
    },
  );

  it('gets consent history for the authenticated user', async () => {
    consentService.getConsents.mockReturnValue([{ type: 'privacy_policy' }]);

    const response = await controller.getConsents(req);

    expect(consentService.getConsents).toHaveBeenCalledWith(userId);
    expect(response.code).toBe(SuccessCode.SETTINGS_FETCHED);
  });

  it('records consent with a string or absent user-agent', async () => {
    consentService.recordConsent.mockResolvedValue({ id: 'consent-1' });
    const dto = { type: 'terms', accepted: true } as never;
    const stringAgentReq = {
      user: { sub: userId },
      ip: '10.0.0.2',
      headers: { 'user-agent': 'matchmate-web/1.0' },
    } as never;

    await controller.recordConsent(stringAgentReq, dto);
    await controller.recordConsent(req, dto);

    expect(consentService.recordConsent).toHaveBeenNthCalledWith(
      1,
      userId,
      dto,
      { ip: '10.0.0.2', userAgent: 'matchmate-web/1.0' },
    );
    expect(consentService.recordConsent).toHaveBeenNthCalledWith(
      2,
      userId,
      dto,
      { ip: '127.0.0.1', userAgent: undefined },
    );
  });
});
