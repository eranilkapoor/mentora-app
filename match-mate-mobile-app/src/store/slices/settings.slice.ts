import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AccessibilitySettings } from '@/features/AccessibilitySettings/AccessibilitySettings.types';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi';

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  highContrastMode: false,
  reduceAnimations: false,
  screenReaderOptimized: false,
  boldText: false,
};

interface SettingsState {
  theme: ThemeMode;
  language: Language;
  accessibility: AccessibilitySettings;

  locationSharing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,

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
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
