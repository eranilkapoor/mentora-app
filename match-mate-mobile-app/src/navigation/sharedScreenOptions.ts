import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { isAndroid } from '@/core/utils/device';
import type { Theme } from '@/core/theme/types';

/**
 * Shared screen options used across all native stack navigators.
 * Centralised here so any header style change propagates everywhere.
 */
export function getSharedScreenOptions(
  theme: Theme
): NativeStackNavigationOptions {
  return {
    headerShown: false,
    headerStyle: {
      backgroundColor: theme.colors.white,
    },
    headerTitleStyle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    headerTintColor: theme.colors.primary,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: {
      backgroundColor: theme.colors.backgroundPage,
    },
    animation: isAndroid ? 'slide_from_right' : 'default',
  };
}
