import { ColorPalette } from './types';

export const LIGHTCOLORS: ColorPalette = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#C7365F',
  primaryLight: '#FCE8EE',
  primaryBorder: '#E6A9BB',

  secondary: '#1F7A74',
  secondaryLight: '#E7F4F2',

  accent: '#B8872E',
  accentLight: '#FFF2D4',

  whatsapp: '#25D366',

  transparent: 'transparent',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#FFFFFF',

  /**
   * Main app page background
   */
  backgroundPage: '#FFF8F3',

  /**
   * Secondary backgrounds
   */
  backgroundLight: '#FCE8EE',

  /**
   * Cards / modals / sections
   */
  surface: '#FFFFFF',

  /**
   * Elevated cards
   */
  surfaceElevated: '#FFFFFF',

  modalOverlay: 'rgba(37,33,38,0.45)',
  overlayDark: 'rgba(0,0,0,0.55)',
  overlayLight: 'rgba(0,0,0,0.12)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#252126',

  textSecondary: '#61545A',

  textMuted: '#8F8188',

  textBody: '#4B4147',

  textInverse: '#FFFFFF',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#E8D7DC',

  divider: '#EDDFE3',

  borderStrong: '#D7B8C2',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#FFFFFF',

  inputBorder: '#D7B8C2',

  inputPlaceholder: '#9C8D94',

  switchTrackOff: '#D7B8C2',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: '#2E7D57',
  successLight: '#DCFCE7',

  warning: '#B7791F',
  warningLight: '#FEF3C7',

  error: '#B4233C',
  errorLight: '#FEE2E2',

  danger: '#B4233C',

  info: '#1F7A74',
  infoLight: '#E7F4F2',

  // ─────────────────────────────────────────────
  // Links / CTA
  // ─────────────────────────────────────────────
  link: '#B02E55',

  chatBtn: '#C7365F',

  shortlistBg: '#FFF2D4',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#22C55E',
  offline: '#A1A1AA',
  verified: '#1F7A74',

  // ─────────────────────────────────────────────
  // Membership
  // ─────────────────────────────────────────────
  gold: '#B8872E',
  platinum: '#E5E7EB',
  membershipHeroStatBackground: 'rgba(255,255,255,0.14)',
  membershipHeroStatBorder: 'rgba(255,255,255,0.28)',

  // ─────────────────────────────────────────────
  // Static
  // ─────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',

  // ─────────────────────────────────────────────
  // Gradients
  // ─────────────────────────────────────────────
  gradients: {
    primary: ['#C7365F', '#B8872E'],
    romantic: ['#F5B8C7', '#C7365F'],
    soft: ['#FFF8F3', '#FCE8EE'],
  },
};

export const DARKCOLORS: Partial<ColorPalette> = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: '#FF7A9E',

  primaryLight: 'rgba(255,122,158,0.16)',

  primaryBorder: 'rgba(255,122,158,0.38)',

  secondary: '#5FC4BD',

  secondaryLight: '#183331',

  accent: '#E0B45A',

  accentLight: 'rgba(224,180,90,0.14)',

  whatsapp: '#2EE07C',

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  background: '#171214',

  backgroundPage: '#100D0F',

  backgroundLight: '#251A1E',

  /**
   * Cards
   */
  surface: '#1E171A',

  /**
   * Elevated cards/modals
   */
  surfaceElevated: '#2A2024',

  modalOverlay: 'rgba(0,0,0,0.7)',

  overlayDark: 'rgba(0,0,0,0.75)',

  overlayLight: 'rgba(255,255,255,0.10)',

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: '#FFF7FA',

  textSecondary: '#E6D8DE',

  textMuted: '#BAA8B1',

  textBody: '#F0E6EA',

  textInverse: '#000000',

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  border: '#42323A',

  divider: '#4C3B44',

  borderStrong: '#5E4852',

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: '#1E171A',

  inputBorder: '#5E4852',

  inputPlaceholder: '#A3919A',

  switchTrackOff: '#52525B',

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: '#5AD18A',
  successLight: 'rgba(90,209,138,0.16)',

  warning: '#F0C15A',
  warningLight: 'rgba(240,193,90,0.16)',

  error: '#FF7A7A',
  errorLight: 'rgba(255,122,122,0.16)',

  danger: '#FF7A7A',

  info: '#5FC4BD',
  infoLight: 'rgba(95,196,189,0.16)',

  link: '#FF9AB7',

  chatBtn: '#FF7A9E',

  shortlistBg: 'rgba(224,180,90,0.16)',

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: '#4ADE80',

  offline: '#6B7280',

  verified: '#5FC4BD',

  gold: '#E0B45A',

  platinum: '#D4D4D8',

  membershipHeroStatBackground: 'rgba(255,255,255,0.08)',
  membershipHeroStatBorder: 'rgba(255,255,255,0.18)',

  // ─────────────────────────────────────────────
  // Gradients
  // ─────────────────────────────────────────────
  gradients: {
    primary: ['#FF7A9E', '#E0B45A'],
    romantic: ['#FF9AB7', '#FF7A9E'],
    soft: ['#251A1E', '#1E171A'],
  },
};
