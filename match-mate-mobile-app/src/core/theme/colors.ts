import { ColorPalette } from './types';

export const LIGHTCOLORS: ColorPalette = {
  // Brand
  primary: '#4F46E5',
  primaryLight: '#EDE9FE',
  primaryBorder: '#C4B5FD',
  transparent: 'transparent',
  accent: '#f59e0b',
  accentLight: '#ffedd5',
  secondary: '#6b7280',
  secondaryLight: '#f3f4f6',
  whatsapp: '#25D366',

  // Backgrounds
  background: '#FFFFFF',
  backgroundLight: '#F2F2F2',
  backgroundPage: '#F8FAFC',
  surface: '#FFFFFF',
  modalOverlay: 'rgba(0,0,0,0.2)',
  overlayDark: 'rgba(0,0,0,0.45)',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#9AA4B2',
  textBody: '#555555',
  textInverse: '#FFFFFF',

  // UI
  border: '#E6E6E6',
  divider: '#EEF2F7',
  inputBackground: '#F7F7F8',
  switchTrackOff: '#cccccc',

  // States
  success: '#16A34A',
  successLight: '#F0FDF4',
  error: '#D9534F',
  errorLight: '#FFF5F5',
  danger: '#ef4444',
  warning: '#F59E0B',

  // Links / CTA
  link: '#007AFF',
  chatBtn: '#ff6b6b',
  shortlistBg: '#fff5e6',

  // Status
  online: '#22C55E',
  offline: '#9CA3AF',
  verified: '#3B82F6',

  // Membership
  gold: '#FFD700',
  platinum: '#E5E4E2',

  // Static
  white: '#FFFFFF',
  black: '#000000',

  // Gradients
  gradients: {
    primary: ['#E94057', '#F27121'],
  },
};

// Only override what actually changes in dark mode
// Every key not listed here inherits from LIGHTCOLORS in darkTheme.ts
export const DARKCOLORS: Partial<ColorPalette> = {
  // Backgrounds
  background: '#121212',
  backgroundLight: '#2A2A2A',
  backgroundPage: '#1E1E1E',
  surface: '#1E1E1E',
  modalOverlay: 'rgba(0,0,0,0.5)',
  overlayDark: 'rgba(0,0,0,0.7)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textBody: '#A1A1AA',
  textInverse: '#000000',

  // UI
  border: '#2C2C2E',
  divider: '#2C2C2E',
  inputBackground: '#2A2A2A',
  switchTrackOff: '#555555',

  // States
  errorLight: '#3B1A1A',
  successLight: '#1A2E22',

  // Status
  online: '#4ADE80',

  // Membership
  platinum: '#C0C0C0',
};
