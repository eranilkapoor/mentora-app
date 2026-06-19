import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AccessibilitySettings } from '@/features/AccessibilitySettings/AccessibilitySettings.types';
import type { MediaSettings } from '@/features/MediaSettings/MediaSettings.types';
import type { LocalizationSettings } from '@/features/LocalizationSettings/LocalizationSettings.types';
import type { NotificationSettings } from '@/features/NotificationSettings/NotificationSettings.types';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi';

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  highContrastMode: false,
  reduceAnimations: false,
  screenReaderOptimized: false,
  boldText: false,
};

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  autoDownloadPhotos: false,
  videoAutoplay: false,
  mediaQuality: 'medium',
  blurPrivatePhotos: false,
  showMediaInGallery: true,
};

export const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettings = {
  appLanguage: 'en',
  preferredLanguages: ['en'],
  region: 'IN',
  timezone: 'Asia/Kolkata',
  shareLocation: false,
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
};

const DEFAULT_CHANNEL_PREFERENCE = {
  inApp: true,
  push: true,
  email: false,
  sms: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  inAppEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  marketingEnabled: false,
  doNotDisturb: false,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'Asia/Kolkata',
  },
  preferences: {
    interestReceived: { ...DEFAULT_CHANNEL_PREFERENCE, email: true },
    interestAccepted: { ...DEFAULT_CHANNEL_PREFERENCE, email: true },
    profileView: {
      ...DEFAULT_CHANNEL_PREFERENCE,
      push: false,
      email: false,
    },
    matchFound: { ...DEFAULT_CHANNEL_PREFERENCE, email: true },
    messageReceived: { ...DEFAULT_CHANNEL_PREFERENCE, email: false },
    subscription: { ...DEFAULT_CHANNEL_PREFERENCE, email: true },
    system: { ...DEFAULT_CHANNEL_PREFERENCE, email: true },
    marketing: {
      inApp: false,
      push: false,
      email: true,
      sms: false,
    },
  },
};

export interface SettingsState {
  theme: ThemeMode;
  language: Language;
  accessibility: AccessibilitySettings;
  media: MediaSettings;
  localization: LocalizationSettings;
  notification: NotificationSettings;

  locationSharing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  media: DEFAULT_MEDIA_SETTINGS,
  localization: DEFAULT_LOCALIZATION_SETTINGS,
  notification: DEFAULT_NOTIFICATION_SETTINGS,

  locationSharing: false,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 🌐 Language
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },

    // 🌙 Theme
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },

    setAccessibilitySettings: (
      state,
      action: PayloadAction<AccessibilitySettings>
    ) => {
      state.accessibility = {
        ...DEFAULT_ACCESSIBILITY_SETTINGS,
        ...action.payload,
      };
    },

    updateAccessibilitySettings: (
      state,
      action: PayloadAction<Partial<AccessibilitySettings>>
    ) => {
      state.accessibility = {
        ...(state.accessibility ?? DEFAULT_ACCESSIBILITY_SETTINGS),
        ...action.payload,
      };
    },

    setMediaSettings: (state, action: PayloadAction<MediaSettings>) => {
      state.media = {
        ...DEFAULT_MEDIA_SETTINGS,
        ...action.payload,
      };
    },

    updateMediaSettings: (
      state,
      action: PayloadAction<Partial<MediaSettings>>
    ) => {
      state.media = {
        ...(state.media ?? DEFAULT_MEDIA_SETTINGS),
        ...action.payload,
      };
    },

    setLocalizationSettings: (
      state,
      action: PayloadAction<LocalizationSettings>
    ) => {
      state.localization = {
        ...DEFAULT_LOCALIZATION_SETTINGS,
        ...action.payload,
      };
      state.language = normalizeLanguage(action.payload.appLanguage);
      state.locationSharing = Boolean(action.payload.shareLocation);
    },

    updateLocalizationSettings: (
      state,
      action: PayloadAction<Partial<LocalizationSettings>>
    ) => {
      state.localization = {
        ...(state.localization ?? DEFAULT_LOCALIZATION_SETTINGS),
        ...action.payload,
      };
      if (action.payload.appLanguage) {
        state.language = normalizeLanguage(action.payload.appLanguage);
      }
      if (typeof action.payload.shareLocation === 'boolean') {
        state.locationSharing = action.payload.shareLocation;
      }
    },

    setNotificationSettings: (
      state,
      action: PayloadAction<NotificationSettings>
    ) => {
      state.notification = mergeNotificationSettings(action.payload);
      state.notificationsEnabled =
        !state.notification.doNotDisturb &&
        (state.notification.inAppEnabled ||
          state.notification.pushEnabled ||
          state.notification.emailEnabled ||
          state.notification.smsEnabled);
      state.soundEnabled = state.notification.soundEnabled;
      state.vibrationEnabled = state.notification.vibrationEnabled;
    },

    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.notification = mergeNotificationSettings({
        ...(state.notification ?? DEFAULT_NOTIFICATION_SETTINGS),
        ...action.payload,
        quietHours: {
          ...(state.notification?.quietHours ??
            DEFAULT_NOTIFICATION_SETTINGS.quietHours),
          ...(action.payload.quietHours ?? {}),
        },
        preferences: {
          ...(state.notification?.preferences ??
            DEFAULT_NOTIFICATION_SETTINGS.preferences),
          ...(action.payload.preferences ?? {}),
        },
      });
      state.notificationsEnabled =
        !state.notification.doNotDisturb &&
        (state.notification.inAppEnabled ||
          state.notification.pushEnabled ||
          state.notification.emailEnabled ||
          state.notification.smsEnabled);
      state.soundEnabled = state.notification.soundEnabled;
      state.vibrationEnabled = state.notification.vibrationEnabled;
    },

    setLocationSharing: (state, action: PayloadAction<boolean>) => {
      state.locationSharing = action.payload;
    },

    // 📍 Location Sharing
    toggleLocationSharing: (state) => {
      state.locationSharing = !state.locationSharing;
    },

    // 🔊 Sound
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },

    // 📳 Vibration
    toggleVibration: (state) => {
      state.vibrationEnabled = !state.vibrationEnabled;
    },

    // 🔔 Notifications
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },

    // 🔄 Reset all
    resetSettings: () => initialState,
  },
});

export const {
  setLanguage,
  setTheme,
  toggleSound,
  toggleVibration,
  toggleNotifications,
  setLocationSharing,
  toggleLocationSharing,
  setAccessibilitySettings,
  updateAccessibilitySettings,
  setMediaSettings,
  updateMediaSettings,
  setLocalizationSettings,
  updateLocalizationSettings,
  setNotificationSettings,
  updateNotificationSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

const normalizeLanguage = (value?: string): Language =>
  value === 'hi' ? 'hi' : 'en';

const mergeNotificationSettings = (
  settings: Partial<NotificationSettings>
): NotificationSettings => ({
  ...DEFAULT_NOTIFICATION_SETTINGS,
  ...settings,
  quietHours: {
    ...DEFAULT_NOTIFICATION_SETTINGS.quietHours,
    ...(settings.quietHours ?? {}),
  },
  preferences: {
    ...DEFAULT_NOTIFICATION_SETTINGS.preferences,
    ...(settings.preferences ?? {}),
  },
});
