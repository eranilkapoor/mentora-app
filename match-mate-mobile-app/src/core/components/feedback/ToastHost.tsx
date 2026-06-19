import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast, {
  ToastConfig,
  ToastConfigParams,
} from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { Theme } from '@/core/theme/types';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

const FEEDBACK_COLORS: Record<
  FeedbackType,
  {
    color: string;
    light: string;
  }
> = {
  success: {
    color: '#16A34A',
    light: 'rgba(22, 163, 74, 0.14)',
  },
  error: {
    color: '#DC2626',
    light: 'rgba(220, 38, 38, 0.14)',
  },
  info: {
    color: '#2563EB',
    light: 'rgba(37, 99, 235, 0.14)',
  },
  warning: {
    color: '#D97706',
    light: 'rgba(217, 119, 6, 0.16)',
  },
};

const FEEDBACK_META: Record<
  FeedbackType,
  {
    icon: React.ComponentProps<typeof Feather>['name'];
    label: string;
  }
> = {
  success: {
    icon: 'check-circle',
    label: 'Success',
  },
  error: {
    icon: 'alert-circle',
    label: 'Error',
  },
  info: {
    icon: 'info',
    label: 'Info',
  },
  warning: {
    icon: 'alert-triangle',
    label: 'Warning',
  },
};

function FeedbackToast({
  type,
  text1,
  text2,
}: ToastConfigParams<unknown> & {
  type: FeedbackType;
}): React.ReactElement {
  const { theme, fontScale, accessibility } = useTheme();
  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        makeStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );
  const meta = FEEDBACK_META[type];
  const color = FEEDBACK_COLORS[type].color;
  const iconBackground = FEEDBACK_COLORS[type].light;

  return (
    <View style={[styles.toastCard, { borderLeftColor: color }]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
        <Feather name={meta.icon} size={18} color={color} />
      </View>
      <View style={styles.toastContent}>
        <Text style={[styles.toastEyebrow, { color }]}>{meta.label}</Text>
        <Text style={styles.toastTitle} numberOfLines={2}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={styles.toastMessage} numberOfLines={3}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function ToastHost(): React.ReactElement {
  const config = useMemo<ToastConfig>(
    () => ({
      success: (params) => <FeedbackToast {...params} type="success" />,
      error: (params) => <FeedbackToast {...params} type="error" />,
      info: (params) => <FeedbackToast {...params} type="info" />,
      warning: (params) => <FeedbackToast {...params} type="warning" />,
    }),
    []
  );

  return <Toast config={config} topOffset={54} bottomOffset={28} />;
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    toastCard: {
      width: '92%',
      maxWidth: 460,
      minHeight: 74,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderLeftWidth: 4,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.14,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    toastContent: {
      flex: 1,
      minWidth: 0,
    },
    toastEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0,
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    toastTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      lineHeight: 19,
    },
    toastMessage: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textBody,
      lineHeight: 17,
    },
  });
