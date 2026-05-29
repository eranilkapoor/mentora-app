export type ColorPalette = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  primary: string;
  primaryLight: string;
  primaryBorder: string;

  secondary: string;
  secondaryLight: string;

  accent: string;
  accentLight: string;

  whatsapp: string;

  transparent: string;

  // ─────────────────────────────────────────────
  // Backgrounds
  // ─────────────────────────────────────────────
  /**
   * Main app background
   */
  background: string;

  /**
   * Screen/page background
   */
  backgroundPage: string;

  /**
   * Light secondary background
   * Chips / icon wrappers / subtle containers
   */
  backgroundLight: string;

  /**
   * Cards / sections
   */
  surface: string;

  /**
   * Elevated surfaces
   * Bottom sheets / modals
   */
  surfaceElevated: string;

  modalOverlay: string;

  overlayDark: string;
  overlayLight: string;

  // ─────────────────────────────────────────────
  // Text
  // ─────────────────────────────────────────────
  textPrimary: string;

  textSecondary: string;

  textMuted: string;

  textBody: string;

  textInverse: string;

  // ─────────────────────────────────────────────
  // Borders / UI
  // ─────────────────────────────────────────────
  border: string;

  divider: string;

  /**
   * Stronger borders for inputs/cards
   */
  borderStrong: string;

  // ─────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────
  inputBackground: string;

  inputBorder: string;

  inputPlaceholder: string;

  switchTrackOff: string;

  // ─────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────
  success: string;

  successLight: string;

  warning: string;

  warningLight: string;

  error: string;

  errorLight: string;

  danger: string;

  info: string;

  infoLight: string;

  // ─────────────────────────────────────────────
  // Links / CTA
  // ─────────────────────────────────────────────
  link: string;

  chatBtn: string;

  shortlistBg: string;

  // ─────────────────────────────────────────────
  // Status
  // ─────────────────────────────────────────────
  online: string;

  offline: string;

  verified: string;

  // ─────────────────────────────────────────────
  // Membership
  // ─────────────────────────────────────────────
  gold: string;

  platinum: string;

  // ─────────────────────────────────────────────
  // Static
  // ─────────────────────────────────────────────
  white: string;

  black: string;

  // ─────────────────────────────────────────────
  // Gradients
  // ─────────────────────────────────────────────
  gradients: {
    primary: string[];
    romantic: string[];
    soft: string[];
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

    h1: {
      fontSize: number;
      fontWeight: string;
      lineHeight?: number;
    };

    h2: {
      fontSize: number;
      fontWeight: string;
      lineHeight?: number;
    };

    h3: {
      fontSize: number;
      fontWeight: string;
      lineHeight?: number;
    };

    body: {
      fontSize: number;
      fontWeight?: string;
      lineHeight?: number;
    };

    caption: {
      fontSize: number;
      fontWeight?: string;
      lineHeight?: number;
    };

    button: {
      fontSize: number;
      fontWeight: string;
      lineHeight?: number;
    };
  };

  layout: {
    screenPadding: number;
    sectionSpacing: number;
    cardPadding: number;
  };

  components: {
    button: {
      height: number;
      borderRadius: number;
    };

    input: {
      height: number;
      borderRadius: number;
      borderWidth: number;
    };

    avatar: {
      size: number;
      radius: number;
    };
  };

  shadows: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };

  zIndex: {
    base: number;
    dropdown: number;
    sticky: number;
    modal: number;
    toast: number;
    tooltip: number;
  };
};

export type ShadowStyle = {
  shadowColor: string;

  shadowOffset: {
    width: number;
    height: number;
  };

  shadowOpacity: number;

  shadowRadius: number;

  elevation: number;
};
