import settingsReducer, {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS,
  setLocalizationSettings,
  setAccessibilitySettings,
  setNotificationSettings,
  updateAccessibilitySettings,
  updatePrivacySettings,
} from './settings.slice';

describe('settings reducer', () => {
  it('keeps language and location summary fields synchronized', () => {
    const state = settingsReducer(
      undefined,
      setLocalizationSettings({
        appLanguage: 'hi',
        preferredLanguages: ['hi'],
        region: 'IN',
        timezone: 'Asia/Kolkata',
        shareLocation: true,
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
      })
    );

    expect(state.language).toBe('hi');
    expect(state.locationSharing).toBe(true);
  });

  it('derives notification, sound, and vibration summaries', () => {
    const state = settingsReducer(
      undefined,
      setNotificationSettings({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        inAppEnabled: false,
        pushEnabled: false,
        emailEnabled: false,
        smsEnabled: false,
        marketingEnabled: false,
        doNotDisturb: false,
        soundEnabled: false,
        vibrationEnabled: false,
      })
    );

    expect(state.notificationsEnabled).toBe(false);
    expect(state.soundEnabled).toBe(false);
    expect(state.vibrationEnabled).toBe(false);
  });

  it('preserves privacy defaults during partial updates', () => {
    const state = settingsReducer(
      undefined,
      updatePrivacySettings({ incognitoMode: true })
    );

    expect(state.privacy).toEqual({
      ...DEFAULT_PRIVACY_SETTINGS,
      incognitoMode: true,
    });
  });

  it('can restore accessibility settings after an optimistic failure', () => {
    const previous = settingsReducer(undefined, { type: 'init' }).accessibility;
    const optimistic = settingsReducer(
      undefined,
      updateAccessibilitySettings({ fontSize: 'extra_large', boldText: true })
    );

    expect(optimistic.accessibility.fontSize).toBe('extra_large');
    expect(optimistic.accessibility.boldText).toBe(true);
    expect(
      settingsReducer(optimistic, setAccessibilitySettings(previous))
    ).toEqual(expect.objectContaining({ accessibility: previous }));
  });
});
