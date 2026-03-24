import { StyleSheet } from 'react-native';
import { SPACING } from './spacing';
import { COLORS } from './colors';

export const LAYOUT = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  padding: {
    padding: SPACING.md,
  },
});
