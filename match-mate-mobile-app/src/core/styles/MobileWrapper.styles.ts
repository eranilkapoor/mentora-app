import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

export const mobileStyles = (theme: Theme) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundPage,
    },
    mobileFrame: {
      maxWidth: 430,
      backgroundColor: theme.colors.backgroundPage,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: `0px 8px 30px ${theme.colors.black}33`,
    },
  });
