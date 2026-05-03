import { StyleSheet } from 'react-native';
import { Theme } from '../theme/types';

export const headerStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.colors.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 2,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
      borderWidth: 1.5,
      borderColor: theme.colors.white,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },

    // 🔍 Search
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 20,
      paddingHorizontal: 12,
      flex: 1,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 6,
      marginLeft: 8,
      color: theme.colors.textPrimary,
    },
  });
