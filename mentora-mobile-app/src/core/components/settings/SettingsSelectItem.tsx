import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@/core/theme/ThemeProvider';
import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

interface Props {
  icon?:
    | React.ComponentProps<typeof Feather>['name']
    | React.ComponentProps<typeof FontAwesome>['name'];
  iconFamily?: 'feather' | 'fontAwesome';
  label: string;
  value?: string;
  sublabel?: string;
  isLast?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  onDisabledPress?: () => void;
  onPress: () => void;
  actionIcon?: React.ComponentProps<typeof Feather>['name'];
  actionAccessibilityLabel?: string;
  actionDestructive?: boolean;
  onActionPress?: () => void;
  showChevron?: boolean;
}

const createStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    row: {
      ...StyleSheet.flatten(base.listRow),
      paddingHorizontal: 0,
      paddingVertical: 0,
    },
    rowLast: { borderBottomWidth: 0 },
    mainPressable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 14,
      paddingVertical: 14,
      paddingRight: 14,
    },
    mainPressableWithAction: {
      paddingRight: 0,
    },
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
    actionButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
  });

export function SettingsSelectItem({
  icon,
  iconFamily = 'feather',
  label,
  value,
  sublabel,
  isLast = false,
  destructive = false,
  disabled = false,
  onDisabledPress,
  onPress,
  actionIcon,
  actionAccessibilityLabel,
  actionDestructive = false,
  onActionPress,
  showChevron = true,
}: Props): React.ReactElement {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Pressable
        onPress={disabled ? onDisabledPress : onPress}
        style={({ pressed }) => [
          styles.mainPressable,
          actionIcon && onActionPress ? styles.mainPressableWithAction : null,
          pressed && !disabled && { opacity: 0.7 },
          disabled && { opacity: 0.4 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled && !onDisabledPress }}
      >
        {icon ? (
          <View
            style={[
              styles.iconWrapper,
              destructive && styles.iconWrapperDestructive,
            ]}
          >
            {iconFamily === 'fontAwesome' ? (
              <FontAwesome
                name={icon as React.ComponentProps<typeof FontAwesome>['name']}
                size={16}
                color={destructive ? theme.colors.error : theme.colors.primary}
              />
            ) : (
              <Feather
                name={icon as React.ComponentProps<typeof Feather>['name']}
                size={16}
                color={destructive ? theme.colors.error : theme.colors.primary}
              />
            )}
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
          {!destructive && showChevron ? (
            <Feather
              name="chevron-right"
              size={16}
              color={theme.colors.textMuted}
            />
          ) : null}
        </View>
      </Pressable>

      {actionIcon && onActionPress ? (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && { opacity: 0.6 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel}
          hitSlop={8}
          onPress={onActionPress}
        >
          <Feather
            name={actionIcon}
            size={17}
            color={
              actionDestructive ? theme.colors.error : theme.colors.textMuted
            }
          />
        </Pressable>
      ) : null}
    </View>
  );
}
