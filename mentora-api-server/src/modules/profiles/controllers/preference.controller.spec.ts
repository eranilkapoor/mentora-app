import { PreferenceController } from './preference.controller';
import { SuccessCode } from '@/common/constants';

describe('PreferenceController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;
  const service = {
    createPreference: jest.fn(),
    getMyPreference: jest.fn(),
    updateFilters: jest.fn(),
    updateSettings: jest.fn(),
    updateWeights: jest.fn(),
    updateAboutPartner: jest.fn(),
  };

  let controller: PreferenceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PreferenceController(service as never);
  });

  it('creates and fetches preferences for the current user', async () => {
    const dto = { aboutPartner: 'Kind and thoughtful' } as never;
    service.createPreference.mockResolvedValue({ id: 'pref-1' });
    service.getMyPreference.mockResolvedValue({ id: 'pref-1' });

    const created = await controller.createPreference(req, dto);
    const detail = await controller.getMyPreference(req);

    expect(service.createPreference).toHaveBeenCalledWith(userId, dto);
    expect(service.getMyPreference).toHaveBeenCalledWith(userId);
    expect(created.code).toBe(SuccessCode.PREFERENCES_UPDATED);
    expect(detail.code).toBe(SuccessCode.PREFERENCES_FETCHED);
  });

  it('updates filters, settings, weights, and about partner text', async () => {
    service.updateFilters.mockResolvedValue({ ok: true });
    service.updateSettings.mockResolvedValue({ ok: true });
    service.updateWeights.mockResolvedValue({ ok: true });
    service.updateAboutPartner.mockResolvedValue({ ok: true });

    await controller.updateFilters(req, { ageMin: 25 } as never);
    await controller.updateSettings(req, { showOnlyVerified: true } as never);
    await controller.updateWeights(req, { religion: 10 });
    const about = await controller.updateAbout(req, {
      aboutPartner: 'Grounded and family oriented',
    });

    expect(service.updateFilters).toHaveBeenCalledWith(userId, { ageMin: 25 });
    expect(service.updateSettings).toHaveBeenCalledWith(userId, {
      showOnlyVerified: true,
    });
    expect(service.updateWeights).toHaveBeenCalledWith(userId, {
      religion: 10,
    });
    expect(service.updateAboutPartner).toHaveBeenCalledWith(
      userId,
      'Grounded and family oriented',
    );
    expect(about.code).toBe(SuccessCode.PREFERENCES_UPDATED);
  });
});
