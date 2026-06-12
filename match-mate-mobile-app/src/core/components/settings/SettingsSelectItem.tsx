import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

interface Props {
  icon?: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value?: string;
  sublabel?: string;
  isLast?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const createStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    row: {
      ...StyleSheet.flatten(base.listRow),
    },
    rowLast: { borderBottomWidth: 0 },
    iconWrapper: {
      ...StyleSheet.flatten(base.iconTile),
      marginRight: 12,
    },
    iconWrapperDestructive: {
      backgroundColor: theme.colors.errorLight,
    },
    textWrapper: { flex: 1 },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    labelDestructive: { color: theme.colors.error },
    sublabel: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    value: {
      fontSize: 13,
      color: theme.colors.textMuted,
    },
  });

export function SettingsSelectItem({
  icon,
  label,
  value,
  sublabel,
  isLast = false,
  destructive = false,
  disabled = false,
  onPress,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        isLast && styles.rowLast,
        pressed && !disabled && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrapper,
            destructive && styles.iconWrapperDestructive,
          ]}
        >
          <Feather
            name={icon}
            size={16}
            color={destructive ? theme.colors.error : theme.colors.primary}
          />
        </View>
      ) : null}

      <View style={styles.textWrapper}>
        <Text style={[styles.label, destructive && styles.labelDestructive]}>
          {label}
        </Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>

      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {!destructive ? (
          <Feather
            name="chevron-right"
            size={16}
            color={theme.colors.textMuted}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
