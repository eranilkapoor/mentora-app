import { Theme } from './types';
import { DARKCOLORS } from './colors';
import { lightTheme } from './lightTheme';
import { LAYOUT } from './layout';

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ...DARKCOLORS,
  },
  layout: LAYOUT,
};
