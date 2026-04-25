import { Theme } from './types';
import { DARKCOLORS } from './colors';
import { lightTheme } from './lightTheme';

export const darkTheme: Theme = {
  ...lightTheme, // inherits spacing, radius, typography, layout, etc.
  colors: {
    ...lightTheme.colors, // start with all light colors
    ...DARKCOLORS, // override only what changes
  },
  // layout is already included via ...lightTheme — no need to re-declare
};
