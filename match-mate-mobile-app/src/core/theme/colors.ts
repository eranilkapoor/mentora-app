import { ColorPalette } from './types';

export const LIGHTCOLORS: ColorPalette = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#5B4CF0',
  primaryLight: '#EEF2FF',
  primaryBorder: '#C7D2FE',

  secondary: '#64748B',
  secondaryLight: '#F1F5F9',

  accent: '#F59E0B',
  accentLight: '#FEF3C7',

  whatsapp: '#25D366',

  transparent: 'transparent',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#FFFFFF',

  /**
   * Main app page background
   */
  backgroundPage: '#F8FAFC',

  /**
   * Secondary backgrounds
   * Used for chips / inputs / icon wrappers
   */
  backgroundLight: '#F1F5F9',

  /**
   * Cards / modals / sections
   */
  surface: '#FFFFFF',

  /**
   * Elevated cards
   */
  surfaceElevated: '#FFFFFF',

  modalOverlay: 'rgba(15,23,42,0.45)',
  overlayDark: 'rgba(0,0,0,0.55)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#0F172A',

  /**
   * Titles / subtitles
   */
  textSecondary: '#475569',

  /**
   * Muted labels / placeholders
   */
  textMuted: '#94A3B8',

  textBody: '#334155',

  textInverse: '#FFFFFF',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#E2E8F0',

  divider: '#EDF2F7',

  /**
   * Input borders
   */
  borderStrong: '#CBD5E1',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#FFFFFF',

  inputBorder: '#CBD5E1',

  inputPlaceholder: '#94A3B8',

  switchTrackOff: '#CBD5E1',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: '#16A34A',
  successLight: '#DCFCE7',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  error: '#DC2626',
  errorLight: '#FEE2E2',

  danger: '#DC2626',

  info: '#2563EB',
  infoLight: '#DBEAFE',

  // ─────────────────────────────────────────────
  // Links / CTA
  // ─────────────────────────────────────────────
  link: '#2563EB',

  chatBtn: '#FF6B6B',

  shortlistBg: '#FFF7ED',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#22C55E',
  offline: '#94A3B8',
  verified: '#3B82F6',

  // ─────────────────────────────────────────────
  // Membership
  // ─────────────────────────────────────────────
  gold: '#FFD700',
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
    primary: ['#5B4CF0', '#7C3AED'],
  },
};

export const DARKCOLORS: Partial<ColorPalette> = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#7C6CFF',

  primaryLight: 'rgba(124,108,255,0.14)',

  primaryBorder: 'rgba(124,108,255,0.35)',

  secondary: '#A1A1AA',

  secondaryLight: '#27272A',

  accentLight: 'rgba(245,158,11,0.12)',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#0F172A',

  backgroundPage: '#020617',

  backgroundLight: '#1E293B',

  /**
   * Cards
   */
  surface: '#111827',

  /**
   * Elevated cards/modals
   */
  surfaceElevated: '#1E293B',

  modalOverlay: 'rgba(0,0,0,0.7)',

  overlayDark: 'rgba(0,0,0,0.75)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#F8FAFC',

  textSecondary: '#CBD5E1',

  textMuted: '#94A3B8',

  textBody: '#E2E8F0',

  textInverse: '#000000',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#1E293B',

  divider: '#273449',

  borderStrong: '#334155',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#0F172A',

  inputBorder: '#334155',

  inputPlaceholder: '#64748B',

  switchTrackOff: '#475569',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  successLight: 'rgba(34,197,94,0.15)',

  warningLight: 'rgba(245,158,11,0.15)',

  errorLight: 'rgba(239,68,68,0.15)',

  infoLight: 'rgba(37,99,235,0.15)',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#4ADE80',

  offline: '#64748B',

  platinum: '#D4D4D8',
};
