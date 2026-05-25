import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { ChannelPreference } from '@/features/NotificationSettings/NotificationSettings.types';

interface ChannelConfig {
  key: keyof ChannelPreference;
  label: string;
}

const CHANNELS: ChannelConfig[] = [
  { key: 'inApp', label: 'In-App' },
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

interface Props {
  label: string;
  sublabel?: string;
  value: ChannelPreference;
  globalEnabled?: boolean;
  isLast?: boolean;
  onChange: (channel: keyof ChannelPreference, value: boolean) => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    containerLast: { borderBottomWidth: 0 },
    header: {
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    sublabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      marginTop: 2,
    },
    channelRow: {
      flexDirection: 'row',
      gap: 8,
    },
    channelItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    channelLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    disabledText: {
      opacity: 0.4,
    },
  });

export function ChannelPreferenceRow({
  label,
  sublabel,
  value,
  globalEnabled = true,
  isLast = false,
  onChange,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, isLast && styles.containerLast]}>
      <View style={styles.header}>
        <Text style={[styles.label, !globalEnabled && styles.disabledText]}>
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={[styles.sublabel, !globalEnabled && styles.disabledText]}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>

      <View style={styles.channelRow}>
        {CHANNELS.map((ch) => (
          <View key={ch.key} style={styles.channelItem}>
            <Text
              style={[
                styles.channelLabel,
                !globalEnabled && styles.disabledText,
              ]}
            >
              {ch.label}
            </Text>
            <Switch
              value={value?.[ch.key] && globalEnabled}
              disabled={!globalEnabled}
              onValueChange={(v) => onChange(ch.key, v)}
              trackColor={{
                false: theme.colors.switchTrackOff,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
              accessibilityLabel={`${label} ${ch.label}`}
              accessibilityRole="switch"
              accessibilityState={{
                checked: value?.[ch.key],
                disabled: !globalEnabled,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
