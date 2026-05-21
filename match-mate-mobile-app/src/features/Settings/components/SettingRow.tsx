import React, { memo } from 'react';

import { TouchableOpacity, View, Text } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { settingsStyles } from '../Settings.styles';
import { SettingRowProps } from '../Settings.types';

export const SettingRow = memo(function SettingRow({
  icon,
  label,
  subLabel,
  badge,
  onPress,
  isLast = false,
  isDanger = false,
  disabled,
}: SettingRowProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);

  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        styles.row,
        isLast && styles.rowLast,
        disabled && styles.rowDisabled,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={subLabel}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.rowIconWrapper,
            isDanger && {
              backgroundColor: theme.colors.primaryLight,
            },
          ]}
        >
          <Feather
            name={icon}
            size={16}
            color={isDanger ? theme.colors.danger : theme.colors.textSecondary}
          />
        </View>

        <View style={styles.rowLabelWrapper}>
          <Text
            style={[
              styles.rowLabel,
              isDanger && {
                color: theme.colors.danger,
              },
            ]}
          >
            {label}
          </Text>

          {subLabel ? <Text style={styles.rowSubLabel}>{subLabel}</Text> : null}
        </View>
      </View>

      <View style={styles.rowRight}>
        {badge ? (
          <View style={styles.rowBadge}>
            <Text style={styles.rowBadgeText}>{badge}</Text>
          </View>
        ) : null}

        <Feather
          name="chevron-right"
          size={16}
          color={theme.colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
});
