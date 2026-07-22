import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
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
  disabledChannels?: Partial<Record<keyof ChannelPreference, boolean>>;
  isLast?: boolean;
  onChange: (channel: keyof ChannelPreference, value: boolean) => void;
  onDisabledChannelPress?: (channel: keyof ChannelPreference) => void;
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
  disabledChannels,
  isLast = false,
  onChange,
  onDisabledChannelPress,
}: Props): React.ReactElement {
  const { theme, fontScale, accessibility } = useTheme();
  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );

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
        {CHANNELS.map((ch) => {
          const channelDisabled = Boolean(disabledChannels?.[ch.key]);
          const disabled = !globalEnabled || channelDisabled;
          const channelTestId = `${label}-${ch.key}-notification-channel`;
          const switchNode = (
            <Switch
              testID={channelTestId}
              value={Boolean(value?.[ch.key]) && !disabled}
              disabled={disabled}
              onValueChange={(v) => onChange(ch.key, v)}
              trackColor={{
                false: theme.colors.switchTrackOff,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
              accessibilityLabel={`${label} ${ch.label}`}
              accessibilityRole="switch"
              accessibilityState={{
                checked: Boolean(value?.[ch.key]) && !disabled,
                disabled,
              }}
            />
          );

          return (
            <View key={ch.key} style={styles.channelItem}>
              <Text
                style={[styles.channelLabel, disabled && styles.disabledText]}
              >
                {ch.label}
              </Text>
              {channelDisabled ? (
                <Pressable
                  accessibilityLabel={`${label} ${ch.label} locked`}
                  accessibilityRole="button"
                  testID={`${channelTestId}-locked`}
                  onPress={() => onDisabledChannelPress?.(ch.key)}
                >
                  {switchNode}
                </Pressable>
              ) : (
                switchNode
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
