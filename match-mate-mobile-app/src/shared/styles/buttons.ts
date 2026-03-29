import { StyleSheet } from 'react-native';
import { COLORS } from './colors';
import { RADIUS, SPACING } from './spacing';

export const BUTTONS = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
  },

  primaryText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  outline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
  },

  outlineText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
