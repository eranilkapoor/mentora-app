import React, { memo } from 'react';

import { View, Text, Switch, Platform } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { settingsStyles } from '../Settings.styles';
import { SettingToggleProps } from '../Settings.types';

export const SettingToggle = memo(function SettingToggle({
  icon,
  label,
  subLabel,
  value,
  onValueChange,
  isLast = false,
  disabled,
}: SettingToggleProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);

  const { theme } = useTheme();

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrapper}>
          <Feather name={icon} size={16} color={theme.colors.textSecondary} />
        </View>

        <View style={styles.rowLabelWrapper}>
          <Text style={styles.rowLabel}>{label}</Text>

          {subLabel ? <Text style={styles.rowSubLabel}>{subLabel}</Text> : null}
        </View>
      </View>

      <Switch
        value={value ?? false}
        onValueChange={onValueChange ?? (() => {})}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityHint={subLabel}
        accessibilityState={{
          checked: value ?? false,
          disabled,
        }}
        trackColor={{
          false: theme.colors.switchTrackOff,
          true: theme.colors.primary,
        }}
        thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
        ios_backgroundColor={theme.colors.switchTrackOff}
      />
    </View>
  );
});
