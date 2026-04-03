export type Theme = {
  colors: {
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
    surface: string; // cards, modals, inputs
    modalOverlay: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;

    // UI
    border: string;
    divider: string;
    inputBackground: string;
    switchTrackOff: string;

    // States
    success: string;
    successLight: string;

    danger: string;
    error: string;
    errorLight: string;

    warning: string;

    // Links / CTA
    link: string;

    // Static (still useful)
    white: string;
    black: string;
  };

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
    };

    h2: {
      fontSize: number;
      fontWeight: string;
    };

    h3: {
      fontSize: number;
      fontWeight: string;
    };

    body: {
      fontSize: number;
      fontWeight?: string;
    };

    caption: {
      fontSize: number;
      fontWeight?: string;
      color: string;
    };

    button: {
      fontSize: number;
      fontWeight: string;
    };
  };

  layout: {
    screenPadding: number;
    sectionSpacing: number;
    cardPadding: number;
  };

  components?: {
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

  shadows?: {
    sm: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };

  zIndex?: {
    dropdown: number;
    modal: number;
    toast: number;
  };
};
