import { SuccessCode } from '@/common/constants';
import { SettingsController } from './settings.controller';

describe('SettingsController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId }, headers: {}, ip: '127.0.0.1' } as never;

  const settingsService = {
    getPrivacy: jest.fn(),
    updatePrivacy: jest.fn(),
    revokeDevice: jest.fn(),
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
});
