import { ColorPalette } from './types';

export const LIGHTCOLORS: ColorPalette = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#E94E77',
  primaryLight: '#FFF1F3',
  primaryBorder: '#F8B4C4',

  secondary: '#8B5E6C',
  secondaryLight: '#FFF5F7',

  accent: '#D9A441',
  accentLight: '#FFF4DA',

  whatsapp: '#25D366',

  transparent: 'transparent',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#FFFFFF',

  /**
   * Main app page background
   */
  backgroundPage: '#FFF9F7',

  /**
   * Secondary backgrounds
   */
  backgroundLight: '#FFF1F3',

  /**
   * Cards / modals / sections
   */
  surface: '#FFFFFF',

  /**
   * Elevated cards
   */
  surfaceElevated: '#FFFFFF',

  modalOverlay: 'rgba(43,43,43,0.45)',
  overlayDark: 'rgba(0,0,0,0.55)',
  overlayLight: 'rgba(0,0,0,0.12)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#2B2B2B',

  textSecondary: '#6F6F6F',

  textMuted: '#9CA3AF',

  textBody: '#4B5563',

  textInverse: '#FFFFFF',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#F1D5DC',

  divider: '#F8E7EB',

  borderStrong: '#E5B7C2',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#FFFFFF',

  inputBorder: '#E5B7C2',

  inputPlaceholder: '#B0A4AA',

  switchTrackOff: '#E5B7C2',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: '#34A853',
  successLight: '#DCFCE7',

  warning: '#E6A23C',
  warningLight: '#FEF3C7',

  error: '#D64545',
  errorLight: '#FEE2E2',

  danger: '#D64545',

  info: '#E94E77',
  infoLight: '#FDE7EC',

  // ─────────────────────────────────────────────
  // Links / CTA
  // ─────────────────────────────────────────────
  link: '#E94E77',

  chatBtn: '#FF5C8A',

  shortlistBg: '#FFF4F6',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#22C55E',
  offline: '#A1A1AA',
  verified: '#E94E77',

  // ─────────────────────────────────────────────
  // Membership
  // ─────────────────────────────────────────────
  gold: '#D9A441',
  platinum: '#E5E7EB',

  // ─────────────────────────────────────────────
  // Static
  // ─────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',

  // ─────────────────────────────────────────────
  // Gradients
  // ─────────────────────────────────────────────
  gradients: {
    primary: ['#E94E77', '#D9A441'],
    romantic: ['#F7C6B6', '#E94E77'],
    soft: ['#FFF1F3', '#FFE4EA'],
  },
};

export const DARKCOLORS: Partial<ColorPalette> = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#FF5C8A',

  primaryLight: 'rgba(255,92,138,0.14)',

  primaryBorder: 'rgba(255,92,138,0.35)',

  secondary: '#D1A8B5',

  secondaryLight: '#2A1F24',

  accent: '#C89B3C',

  accentLight: 'rgba(200,155,60,0.12)',

  whatsapp: '#2EE07C',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#121212',

  backgroundPage: '#0D0D0D',

  backgroundLight: '#1F1A1D',

  /**
   * Cards
   */
  surface: '#1A1A1A',

  /**
   * Elevated cards/modals
   */
  surfaceElevated: '#242424',

  modalOverlay: 'rgba(0,0,0,0.7)',

  overlayDark: 'rgba(0,0,0,0.75)',

  overlayLight: 'rgba(255,255,255,0.10)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#F8F8F8',

  textSecondary: '#D1D5DB',

  textMuted: '#9CA3AF',

  textBody: '#E5E7EB',

  textInverse: '#000000',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#2D2D2D',

  divider: '#3A3A3A',

  borderStrong: '#4B4B4B',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#1A1A1A',

  inputBorder: '#3A3A3A',

  inputPlaceholder: '#6B7280',

  switchTrackOff: '#52525B',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: '#42C777',
  successLight: 'rgba(66,199,119,0.15)',

  warning: '#F5B041',
  warningLight: 'rgba(245,176,65,0.15)',

  error: '#FF6B6B',
  errorLight: 'rgba(255,107,107,0.15)',

  danger: '#FF6B6B',

  info: '#FF5C8A',
  infoLight: 'rgba(255,92,138,0.15)',

  link: '#FF7EA3',

  chatBtn: '#FF5C8A',

  shortlistBg: 'rgba(200,155,60,0.14)',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#4ADE80',

  offline: '#6B7280',

  verified: '#FF5C8A',

  gold: '#E7B64C',

  platinum: '#D4D4D8',

  // ─────────────────────────────────────────────
  // Gradients
  // ─────────────────────────────────────────────
  gradients: {
    primary: ['#FF5C8A', '#C89B3C'],
    romantic: ['#FF8FAB', '#FF5C8A'],
    soft: ['#2A1F24', '#1A1A1A'],
  },
};
