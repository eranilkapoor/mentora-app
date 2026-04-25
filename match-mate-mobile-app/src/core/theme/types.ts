export type ColorPalette = {
  // Brand
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  transparent: string;
  accent: string;
  accentLight: string;
  secondary: string;
  secondaryLight: string;
  whatsapp: string;

  // Backgrounds
  background: string;
  backgroundPage: string;
  backgroundLight: string;
  surface: string;
  modalOverlay: string;
  overlayDark: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textBody: string;
  textInverse: string;

  // UI
  border: string;
  divider: string;
  inputBackground: string;
  switchTrackOff: string;

  // States
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  danger: string;
  warning: string;

  // Links / CTA
  link: string;
  chatBtn: string;
  shortlistBg: string;

  // Status
  online: string;
  offline: string;
  verified: string;

  // Membership
  gold: string;
  platinum: string;

  // Static
  white: string;
  black: string;

  // Gradients
  gradients: {
    primary: string[];
  };
};

export type Theme = {
  colors: ColorPalette;

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };

  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    pill: number;
  };

  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    h1: { fontSize: number; fontWeight: string };
    h2: { fontSize: number; fontWeight: string };
    h3: { fontSize: number; fontWeight: string };
    body: { fontSize: number; fontWeight?: string };
    caption: { fontSize: number; fontWeight?: string };
    button: { fontSize: number; fontWeight: string };
  };

  layout: {
    screenPadding: number;
    sectionSpacing: number;
    cardPadding: number;
  };

  components: {
    button: { height: number; borderRadius: number };
    input: { height: number; borderRadius: number; borderWidth: number };
    avatar: { size: number; radius: number };
  };

  shadows: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };

  zIndex: {
    base: number;
    dropdown: number;
    modal: number;
    toast: number;
  };
};

type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};
