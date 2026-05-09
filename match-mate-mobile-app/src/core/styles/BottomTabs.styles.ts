import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

export const bottomTabsStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.colors.white,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 3,
    },
  });
