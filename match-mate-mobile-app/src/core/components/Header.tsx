import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { Theme } from '@/core/theme/types';

const headerStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 2,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logoWrapper: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appName: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    tagline: {
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
    notifDot: {
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
    avatarBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      borderColor: theme.colors.primaryLight,
    },
  });

interface HeaderProps {
  onFilter?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  hasUnread?: boolean;
}

export default function Header({
  onFilter,
  onNotifications,
  onSettings,
  hasUnread = false,
}: HeaderProps): React.ReactElement {
  const styles = useThemedStyles(headerStyles);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoWrapper}>
          <Feather name="heart" size={18} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.appName}>MatchMate</Text>
          <Text style={styles.tagline}>Find your perfect match</Text>
        </View>
      </View>

      <View style={styles.right}>
        {onFilter !== undefined && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onFilter}
            accessibilityRole="button"
            accessibilityLabel="Filter"
          >
            <Feather name="sliders" size={17} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onNotifications}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Feather name="bell" size={17} color={Colors.textSecondary} />
          {hasUnread && <View style={styles.notifDot} />}
        </TouchableOpacity>

        {onSettings !== undefined && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Feather name="settings" size={17} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
