import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'hi';

interface SettingsState {
  theme: ThemeMode;
  language: Language;

  locationSharing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
}

const initialState: SettingsState = {
  theme: 'system',
  language: 'en',

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
  toggleLocationSharing,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
