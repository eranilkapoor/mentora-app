import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRowProps } from '../EditProfile.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editProfileStyles } from '../EditProfile.styles';

export function ToggleRow({
  label,
  value,
  onChange,
  sublabel,
}: ToggleRowProps): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.rowToggle}>
      <View style={styles.safe}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.sublabel, { color: theme.colors.textMuted }]}>
            {sublabel}
          </Text>
        )}
      </View>
      <Switch
        value={value ?? false}
        onValueChange={onChange}
        trackColor={{
          false: theme.colors.switchTrackOff,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}
