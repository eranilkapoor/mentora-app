import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRowProps } from '../EditPreference.types';
import { editPreferenceStyles } from '../EditPreference.styles';

export function PreferenceToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: ToggleRowProps): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel ? (
          <Text style={styles.toggleSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
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